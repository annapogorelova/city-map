const {optional} = require("tooleks");
const utils = require("./wikiUtils");
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

        if(streetInfo && isStreet) {
            result["street"] = {
                wikiUrl: optional(() => streetInfo.wikiUrl, null),
                description: optional(() => utils.formatText(streetInfo.content, maxLength), null)
            };
        }

        let personTitle = optional(() =>
            streetInfo.info[constants[lang].NAMED_AFTER_INFOBOX_KEY],
        utils.extractStreetName(streetName, lang));

        const namedEntityInfo = await this.searchNamedEntityArticle(personTitle, lang);

        if (namedEntityInfo && utils.isNamedEntityCategory(namedEntityInfo.categories, lang)) {
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
            if(results.length) {
                return this.getPage(results[0]);
            }
        }

        return null;
    }

    async searchNamedEntityArticle(articleName, lang) {
        const searchResult = await this.wikiApiService.search(articleName, lang, 20);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        for(let result of searchResult.results) {
            let page = await this.getPage(result);
            if(page && page.categories && utils.isNamedEntityCategory(page.categories)) {
                return page;
            }
        }

        return null;
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