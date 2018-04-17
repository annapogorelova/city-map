const {optional} = require("tooleks");
const utils = require("./wikiUtils");
const stringUtils = require("./stringUtils");
const constants = require("./constants");
const shevchenko = require("shevchenko");

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
                result["street"] = {
                    wikiUrl: optional(() => streetInfo.wikiUrl, null),
                    description: optional(() => utils.formatText(streetInfo.summary, maxLength), null)
                };
            }
        }

        // Main Strategy - search in the General street article
        let namedEntityTitle = await this.getGeneralStreetNamedEntity(streetName);
        let namedEntityInfo;

        if(namedEntityTitle) {
             namedEntityInfo = await this.getPage(namedEntityTitle);
        } else {
            namedEntityTitle = this.getNamedEntityName(streetName, streetInfo);
            namedEntityInfo = await this.searchNamedEntityArticle(namedEntityTitle);
        }

        if (namedEntityInfo) {
            result["namedEntity"] = {
                name: namedEntityInfo.title,
                description: optional(() => utils.formatText(namedEntityInfo.summary, maxLength), ""),
                imageUrl: namedEntityInfo.imageUrl,
                wikiUrl: namedEntityInfo.wikiUrl
            };
        }

        return result;
    }

    getNamedEntityName(streetName, streetInfo) {
        return optional(() => streetInfo.info[constants[this.lang].NAMED_AFTER_INFOBOX_KEY], undefined) ||
            utils.extractStreetName(streetName, this.lang);
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

    async searchNamedEntityArticle(articleName, limit = 20, minRate = 1.2) {
        const searchResult = await this.wikiApiService.search(articleName, this.lang, limit);
        const results = optional(() => searchResult.results, []);
        if (!results.length) {
            return null;
        }

        let resultCandidates = [];
        const articleNameParts = articleName.match(constants[this.lang].wordsSplitRegex);

        for (let i = 0; i < results.length; i++) {
            let pageTitle = results[i];
            let page = await this.getPage(pageTitle);

            if (optional(() => utils.isNamedEntityCategory(page.categories, this.lang), null)) {
                let rate = this.getPageRate(articleName, pageTitle, page.categories);

                // If it's a person and rate is worth checking, then do the genitive case validity check
                if(rate >= minRate && articleNameParts.length === 1 && this.isPersonCategory(page)) {
                    const lastName = this.extractLastName(page);
                    if(!this.lastNameMatches(lastName, articleName)) {
                        rate = 0;
                    }
                }

                if(rate >= minRate) {
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

    extractLastName(page) {
        //let personName = optional(() => page.info[constants[this.lang].nameInfoBoxProperty], undefined);

        // Infobox case: Тарас Григорович Шевченко
        // if(personName !== undefined && personName !== page.title) {
        //     const nameParts = personName.match(constants[this.lang].wordsSplitRegex);
        //     return optional(() => nameParts[nameParts.length - 1], "");
        // }

        // Title case: Шевченко Тарас Григорович
        const nameParts = page.title.match(constants[this.lang].wordsSplitRegex);
        return nameParts.length === 3 ? nameParts[0] : nameParts[nameParts.length - 1];
    }

    lastNameMatches(lastName, expectedLastName) {
        const male = {
            gender: "male",
            lastName: lastName
        };

        const female = {
            gender: "female",
            lastName: lastName
        };

        const resultMale = shevchenko.inGenitive(male);
        const resultFemale = shevchenko.inGenitive(female);

        return (resultMale.lastName === expectedLastName || resultFemale.lastName === expectedLastName);
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