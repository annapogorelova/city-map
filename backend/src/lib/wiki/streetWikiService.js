const constants = require("./constants");

class StreetWikiService {
    constructor(wikiService) {
        this.wikiService = wikiService;
    }

    async getStreetDescription(streetName, cityName, lang) {
        let description = await this.getStreetNamedAfterWikiDescription(streetName, lang);
        if (description) {
            return description;
        }

        return this.getStreetWikiDescription(streetName, cityName, lang);
    }

    async getStreetWikiDescription(streetName, cityName, lang = "uk") {
        const streetInfo = await this.searchArticle(`${streetName} (${cityName})`, lang);
        return streetInfo ? streetInfo.content : null;
    }

    async getStreetNamedAfterWikiDescription(streetName, lang = "uk") {
        const title = this.extractStreetName(streetName, lang);
        const namedByInfo = await this.searchArticle(title, lang);
        if (namedByInfo && this.isPersonCategory(namedByInfo.categories, lang)) {
            return namedByInfo.content;
        }

        return null;
    }

    async searchArticle(articleName, lang) {
        const searchResult = await this.wikiService.search(articleName, lang, 1);
        if (!searchResult || !searchResult.results.length) {
            return null;
        }

        const articleTitle = searchResult.results[0];
        return this.getPageContent(articleTitle);
    }

    async getPageContent(title) {
        try {
            const page = await this.wikiService.getPage(title);
            const pageContent = await Promise.all([page.content(), page.categories(), page.mainImage()]);
            return {
                content: pageContent[0],
                categories: pageContent[1],
                mainImage: pageContent[2]
            };
        } catch (err) {
            throw err;
        }
    }

    extractStreetName(streetName, lang = "uk") {
        return streetName.replace(constants.regexp[lang].streetType, "").trim();
    }

    isPersonCategory(categories, lang = "uk") {
        return categories.indexOf(constants.categories[lang].PEOPLE_STREETS_NAMED_AFTER) !== -1;
    }
}

module.exports = StreetWikiService;