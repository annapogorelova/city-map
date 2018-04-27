const {optional} = require("tooleks");
const wikiUtils = require("./wikiUtils");
const utils = require("../../app/utils");
const stringUtils = require("./stringUtils");
const constants = require("../../app/constants");

/**
 * Class contains methods for searching the streets articles in Wikipedia
 */
class WikiService {
    constructor(wikiApiService, lang = "uk") {
        this.wikiApiService = wikiApiService;
        this.lang = lang;
    }

    async getNamedEntityInfo(streetName, namedAfter, maxLength = 500) {
        let namedEntityTitle = await this.getGeneralStreetNamedEntity(streetName);
        let namedEntityInfo;

        if(namedEntityTitle) {
            namedEntityInfo = await this.getPage(namedEntityTitle);
        } else {
            namedEntityTitle = namedAfter ? namedAfter : utils.extractStreetName(streetName);
            namedEntityInfo = await this.searchNamedEntityArticle(namedEntityTitle);
        }

        return namedEntityInfo ? this.mapPageToNamedEntity(namedEntityInfo, maxLength) : null;
    }

    mapPageToNamedEntity(page, maxLength = 500) {
        return {
            name: page.title,
            description: optional(() => wikiUtils.formatText(page.summary, maxLength), ""),
            imageUrl: page.imageUrl,
            wikiUrl: page.wikiUrl,
            tags: this.extractTags(page.categories)
        };
    }

    async getStreetInfo(streetName, cityName, maxLength = 500) {
        const exactArticleName = `${streetName} (${cityName})`;
        const exactStreetSearchResults = await this.wikiApiService.search(exactArticleName, this.lang, 1);
        const streetArticle = wikiUtils.filterValidStreetResults(
            exactArticleName,
            exactStreetSearchResults.results)[0];

        let streetInfo;
        if(streetArticle) {
            streetInfo = await this.getPage(streetArticle);
            const isStreet = optional(() => wikiUtils.isStreetCategory(streetInfo.categories), false);

            if (streetInfo && isStreet) {
                return {
                    wikiUrl: optional(() => streetInfo.wikiUrl, null),
                    description: optional(() => wikiUtils.formatText(streetInfo.summary, maxLength), null)
                };
            }
        }

        return null;
    }

    async getGeneralStreetNamedEntity(streetName) {
        const searchResults = await this.wikiApiService.search(streetName, this.lang, 5);
        const articleTitle = wikiUtils.findGeneralStreetArticle(streetName, searchResults.results);

        if(articleTitle && wikiUtils.streetNamesMatch(streetName, articleTitle)) {
            const article = await this.wikiApiService.getPage(articleTitle);
            let pageContent = await article.summary();
            if(!pageContent) {
                pageContent = await article.content();
            }

            return optional(() => pageContent.match(constants.namedAfterArticleRegex)[1], undefined);
        }

        return null;
    }

    async searchNamedEntityArticle(articleName, limit = 20, minRate = 1.4) {
        const searchResult = await this.wikiApiService.search(articleName, this.lang, limit);
        const results = optional(() => searchResult.results, []);
        if (!results.length) {
            return null;
        }

        let resultCandidates = [];

        for (let i = 0; i < results.length; i++) {
            let pageTitle = results[i];
            let page = await this.getPage(pageTitle);

            if (optional(() => wikiUtils.isNamedEntityCategory(page.categories), null)) {
                let rate = this.getPageRate(articleName, pageTitle, page.categories);
                const namesInflectionMatch = stringUtils.namesInflectionMatch(articleName, page.title);

                if(rate > 0 && articleName !== page.title && !namesInflectionMatch) {
                    rate -= minRate;
                }

                if(rate < minRate) {
                    continue;
                }

                resultCandidates.push({page: page, rate: rate});
            }
        }

        if (!resultCandidates.length) {
            return null;
        }

        resultCandidates.map((rc, idx) =>
            rc.rate += rc.rate + ((resultCandidates.length - idx) / resultCandidates.length));

        // Order by descending rate
        return optional(() => resultCandidates.sort((a, b) => {
            return a.rate < b.rate ? 1 : (a.rate > b.rate ? -1 : 0);
        })[0].page, null);
    }

    getPageRate(searchPhrase, pageTitle, pageCategories) {
        let rate = stringUtils.calculatePhrasesMatchRate(searchPhrase, pageTitle);
        if (pageCategories.length) {
            const category = this.findMainCategory(pageCategories);
            if(category && rate > 0) {
                rate += (category.priority / 10);
            }
        }

        return rate;
    }

    findMainCategory(categories) {
        let categoryOrderDescFn = function (a, b) {
            return a.priority < b.priority ? 1 : (a.priority > b.priority ? -1 : 0);
        };

        return optional(() => constants.namedEntityCategories.filter(c =>
            categories.some(category => wikiUtils.normalizeCategoryName(category).startsWith(c.name)))
            .sort(categoryOrderDescFn)[0], null);
    }

    async getPage(title) {
        try {
            const page = await this.wikiApiService.getPage(title);
            const pageContent = await Promise.all([
                optional(() => page.info(), null),
                optional(() => page.summary(), ""),
                optional(() => page.content(), ""),
                optional(() => page.categories(), []),
                optional(() => wikiUtils.mainImage(page), null)
            ]);
            return {
                title: stringUtils.cleanText(title),
                info: pageContent[0],
                summary: stringUtils.cleanText(pageContent[1]),
                content: stringUtils.cleanText(pageContent[2]),
                categories: pageContent[3],
                imageUrl: pageContent[4],
                wikiUrl: optional(() => page.raw.fullurl, "")
            };
        } catch (err) {
            return null;
        }
    }

    extractTags(categories) {
        return constants.tags.filter(tag =>
            categories.some(category => category.match(new RegExp(`${tag}`, "i"))));
    }
}

module.exports = WikiService;