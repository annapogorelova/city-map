const {optional} = require("tooleks");
const utils = require("./wikiUtils");
const stringUtils = require("./stringUtils");
const constants = require("./constants");

/**
 * Class contains methods for searching the streets articles in Wikipedia
 */
class WikiService {
    constructor(wikiApiService) {
        this.wikiApiService = wikiApiService;
    }

    async getStreetInfo(streetName, cityName, maxLength = 500, lang = "uk") {
        let result = {};

        const streetInfo = await this.getWikiInfo(streetName, cityName, lang);
        const isStreet = optional(() => utils.isStreetCategory(streetInfo.categories), false);

        if (streetInfo && isStreet) {
            result["street"] = {
                wikiUrl: optional(() => streetInfo.wikiUrl, null),
                description: optional(() => utils.formatText(streetInfo.content, maxLength), null)
            };
        }

        let namedEntityTitle = optional(() =>
                streetInfo.info[constants[lang].NAMED_AFTER_INFOBOX_KEY],
            utils.extractStreetName(streetName, lang));

        const namedEntityInfo = await this.searchNamedEntityArticle(namedEntityTitle, lang);

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

    async getWikiInfo(streetName, cityName, lang = "uk") {
        return this.searchStreetArticle(`${streetName} (${cityName})`, lang);
    }

    async searchStreetArticle(articleName, lang) {
        const searchResult = await this.wikiApiService.search(articleName, lang, 1);
        if (optional(() => searchResult.results.length, null)) {
            const results = utils.filterValidStreetResults(articleName, searchResult.results, lang);
            if (results.length) {
                return this.getPage(results[0]);
            }
        }

        return null;
    }

    async searchNamedEntityArticle(articleName, lang, limit = 20) {
        const searchResult = await this.wikiApiService.search(articleName, lang, limit);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        const rates = stringUtils.getResultsMatchRates(articleName, searchResult.results);
        let resultCandidates = [];

        for (let i = 0; i < searchResult.results.length; i++) {
            let page = await this.getPage(searchResult.results[i]);
            if (optional(() => utils.isNamedEntityCategory(page.categories, lang), null)) {
                let rate = rates[i];
                if (page.categories.length) {
                    const category = this.findMainCategory(page.categories, lang);
                    if(category) {
                        rate = this.addCategoryWeight(rates[i], category);
                    }
                }
                resultCandidates.push({page: page, rate: rate});
            }
        }

        resultCandidates = resultCandidates.filter(rc => rc.rate !== 0);

        if (!resultCandidates.length) {
            return null;
        }

        resultCandidates.map((rc, idx) =>
            rc.rate += this.addOrderWeight(rc.rate, idx, resultCandidates.length));

        // Order by descending rate
        return optional(() => resultCandidates.sort((a, b) => {
            if (a.rate < b.rate) {
                return 1;
            }

            if (a.rate > b.rate) {
                return -1;
            }

            return 0;
        })[0].page, null);
    }

    addOrderWeight(rate, idx, resultsLength) {
        return (rate + ((resultsLength - idx) / resultsLength));
    }

    addCategoryWeight(rate, category) {
        return rate + (category.priority / 10);
    }

    findMainCategory(categories, lang) {
        return optional(() => constants[lang].namedEntityCategories.filter(c =>
            categories.some(cat => utils.normalizeCategoryName(cat, lang).startsWith(c.name)))
                .sort(this._categoryOrderDesc)[0], null);
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

    _categoryOrderDesc(a, b) {
        if (a.priority < b.priority) {
            return 1;
        }

        if (a.priority > b.priority) {
            return -1;
        }

        return 0;
    }
}

module.exports = WikiService;