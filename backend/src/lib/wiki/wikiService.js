const {optional} = require("tooleks");
const utils = require("./wikiUtils");
const stringUtils = require("./stringUtils");
const constants = require("./constants");

/**
 * Class contains methods for searching the streets articles in Wikipedia
 */
class WikiService {
    constructor(wikiApiService, lang = "uk") {
        this.wikiApiService = wikiApiService;
        this.lang = lang;
    }

    async getStreetInfo(streetName, cityName, maxLength = 500) {
        let result = {};

        const streetInfo = await this.getWikiInfo(streetName, cityName);
        const isStreet = optional(() => utils.isStreetCategory(streetInfo.categories), false);

        if (streetInfo && isStreet) {
            result["street"] = {
                wikiUrl: optional(() => streetInfo.wikiUrl, null),
                description: optional(() => utils.formatText(streetInfo.content, maxLength), null)
            };
        }

        let namedEntityTitle = optional(() =>
            streetInfo.info[constants[this.lang].NAMED_AFTER_INFOBOX_KEY],
        utils.extractStreetName(streetName, this.lang));

        const namedEntityInfo = await this.searchNamedEntityArticle(namedEntityTitle, this.lang);

        if (namedEntityInfo) {
            result["namedEntity"] = {
                name: namedEntityInfo.title,
                description: optional(() => utils.formatText(namedEntityInfo.content, maxLength), ""),
                imageUrl: namedEntityInfo.imageUrl,
                wikiUrl: namedEntityInfo.wikiUrl
            };
        }

        return result;
    }

    async getWikiInfo(streetName, cityName) {
        return this.searchStreetArticle(`${streetName} (${cityName})`, this.lang);
    }

    async searchStreetArticle(articleName) {
        const searchResult = await this.wikiApiService.search(articleName, this.lang, 1);
        if (optional(() => searchResult.results.length, null)) {
            const results = utils.filterValidStreetResults(articleName, searchResult.results, this.lang);
            if (results.length) {
                return this.getPage(results[0]);
            }
        }

        return null;
    }

    async searchNamedEntityArticle(articleName, limit = 20) {
        const searchResult = await this.wikiApiService.search(articleName, this.lang, limit);
        const results = optional(() => searchResult.results, []);
        if (!results.length) {
            return null;
        }

        let resultCandidates = [];

        for (let i = 0; i < results.length; i++) {
            let pageTitle = results[i];
            let page = await this.getPage(pageTitle);
            if (optional(() => utils.isNamedEntityCategory(page.categories, this.lang), null)) {
                let rate = this.getPageRate(articleName, pageTitle, page.categories);
                if(rate > 0) {
                    resultCandidates.push({page: page, rate: rate});
                }
            }
        }

        if (!resultCandidates.length) {
            return null;
        }

        resultCandidates.map((rc, idx) =>
            rc.rate += this.addOrderWeight(rc.rate, idx, resultCandidates.length));

        // Order by descending rate
        return optional(() => resultCandidates.sort((a, b) => {
            return a.rate < b.rate ? 1 : (a.rate > b.rate ? -1 : 0);
        })[0].page, null);
    }

    getPageRate(searchPhrase, pageTitle, pageCategories) {
        let rate = stringUtils.calculatePhrasesMatchRate(searchPhrase, pageTitle);
        if (pageCategories.length) {
            const category = this.findMainCategory(pageCategories, this.lang);
            if(category) {
                rate = this.incrementByCategoryWeight(rate, category);
            }
        }

        return rate;
    }

    addOrderWeight(rate, idx, resultsLength) {
        return (rate + ((resultsLength - idx) / resultsLength));
    }

    incrementByCategoryWeight(rate, category) {
        return rate + (category.priority / 10);
    }

    findMainCategory(categories) {
        let categoryOrderDescFn = function (a, b) {
            return a.priority < b.priority ? 1 : (a.priority > b.priority ? -1 : 0);
        };

        return optional(() => constants[this.lang].namedEntityCategories.filter(c =>
            categories.some(cat => utils.normalizeCategoryName(cat, this.lang).startsWith(c.name)))
            .sort(categoryOrderDescFn)[0], null);
    }

    async getPage(title) {
        try {
            const page = await this.wikiApiService.getPage(title);
            const pageContent = await Promise.all([
                optional(() => page.info(), null),
                optional(() => page.summary(), ""),
                optional(() => page.categories(), []),
                optional(() => utils.mainImage(page), null)
            ]);
            return {
                title: title,
                info: pageContent[0],
                content: pageContent[1],
                categories: pageContent[2],
                imageUrl: pageContent[3],
                wikiUrl: optional(() => page.raw.fullurl, "")
            };
        } catch (err) {
            return null;
        }
    }
}

module.exports = WikiService;