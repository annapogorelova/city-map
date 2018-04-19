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

    async getNamedEntityInfo(streetName, namedAfter, maxLength = 500) {
        let namedEntityTitle = await this.getGeneralStreetNamedEntity(streetName);
        let namedEntityInfo;

        if(namedEntityTitle) {
            namedEntityInfo = await this.getPage(namedEntityTitle);
        } else {
            namedEntityTitle = namedAfter ? namedAfter : utils.extractStreetName(streetName, this.lang);
            namedEntityInfo = await this.searchNamedEntityArticle(namedEntityTitle);
        }

        if (namedEntityInfo) {
            return {
                name: namedEntityInfo.title,
                description: optional(() => utils.formatText(namedEntityInfo.summary, maxLength), ""),
                imageUrl: namedEntityInfo.imageUrl,
                wikiUrl: namedEntityInfo.wikiUrl
            };
        }

        return null;
    }

    async getStreetInfo(streetName, cityName, maxLength = 500) {
        const exactArticleName = `${streetName} (${cityName})`;
        const exactStreetSearchResults = await this.wikiApiService.search(exactArticleName, this.lang, 1);
        const streetArticle = utils.filterValidStreetResults(
            exactArticleName,
            exactStreetSearchResults.results,
            this.lang)[0];

        let streetInfo;
        if(streetArticle) {
            streetInfo = await this.getPage(streetArticle);
            const isStreet = optional(() => utils.isStreetCategory(streetInfo.categories), false);

            if (streetInfo && isStreet) {
                return {
                    wikiUrl: optional(() => streetInfo.wikiUrl, null),
                    description: optional(() => utils.formatText(streetInfo.summary, maxLength), null)
                };
            }
        }

        return null;
    }

    async getGeneralStreetNamedEntity(streetName) {
        const searchResults = await this.wikiApiService.search(streetName, this.lang, 5);
        const articleTitle = utils.findGeneralStreetArticle(streetName, searchResults.results, this.lang);

        if(articleTitle) {
            const article = await this.wikiApiService.getPage(articleTitle);
            let pageContent = await article.summary();
            if(!pageContent) {
                pageContent = await article.content();
            }

            return optional(() => pageContent.match(constants[this.lang].namedAfterArticleRegex)[1], undefined);
        }

        return null;
    }

    async searchNamedEntityArticle(articleName, limit = 10, minRate = 1.4) {
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

                if(rate < minRate) {
                    continue;
                }

                if(this.isPersonCategory(page) && !stringUtils.namesMatch(articleName, page.title)) {
                    continue;
                }

                resultCandidates.push({page: page, rate: rate});
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

    isPersonCategory(page) {
        return optional(() => this.findMainCategory(page.categories).isPerson, false);
    }

    getPageRate(searchPhrase, pageTitle, pageCategories) {
        let rate = stringUtils.calculatePhrasesMatchRate(searchPhrase, pageTitle);
        if (pageCategories.length) {
            const category = this.findMainCategory(pageCategories, this.lang);
            if(category && rate > 0) {
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
                optional(() => page.content(), ""),
                optional(() => page.categories(), []),
                optional(() => utils.mainImage(page), null)
            ]);
            return {
                title: title,
                info: pageContent[0],
                summary: pageContent[1],
                content: pageContent[2],
                categories: pageContent[3],
                imageUrl: pageContent[4],
                wikiUrl: optional(() => page.raw.fullurl, "")
            };
        } catch (err) {
            return null;
        }
    }
}

module.exports = WikiService;