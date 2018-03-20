const constants = require("./constants");

class StreetWikiService {
    constructor(wikiService) {
        this.wikiService = wikiService;
    }

    async getStreetInfo(streetName, cityName, maxLength = 500, lang = "uk") {
        const [streetInfo, namedAfterInfo] = await Promise.all([
            this.getWikiInfo(streetName, cityName, lang),
            this.getNamedAfterWikiInfo(streetName, lang)
        ]);

        let result = {
            description: (streetInfo && streetInfo.content) ?
                this.formatText(streetInfo.content, maxLength) : null,
            namedAfterDescription: null,
            imageUrl: streetInfo ? streetInfo.imageUrl : null,
            wikiUrl: streetInfo ? streetInfo.wikiUrl : null
        };

        if (!namedAfterInfo) {
            return result;
        }

        const categories = namedAfterInfo.categories;
        if (this.isPersonCategory(categories, lang)) {
            result.namedAfterDescription = namedAfterInfo.content ?
                this.formatText(namedAfterInfo.content, maxLength) : null;
            result.namedAfterWikiUrl = namedAfterInfo.wikiUrl;

            if (namedAfterInfo.imageUrl) {
                result.imageUrl = namedAfterInfo.imageUrl;
            }
        }

        return result;
    }

    async getWikiInfo(streetName, cityName, lang = "uk") {
        return this.searchArticle(`${streetName} (${cityName})`, lang);
    }

    async getNamedAfterWikiInfo(streetName, lang = "uk") {
        const title = this.extractStreetName(streetName, lang);
        return this.searchArticle(title, lang);
    }

    async searchArticle(articleName, lang) {
        const searchResult = await this.wikiService.search(articleName, lang, 1);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        const articleTitle = searchResult.results[0];
        return this.getPageContent(articleTitle);
    }

    async getPageContent(title) {
        try {
            const page = await this.wikiService.getPage(title);
            const pageContent = await Promise.all([
                page.summary(),
                page.categories()
            ]);
            return {
                content: pageContent[0],
                categories: pageContent[1],
                imageUrl: await this.extractImage(page),
                wikiUrl: page.raw.fullurl
            };
        } catch (err) {
            throw err;
        }
    }

    async extractImage(page) {
        try {
            const imageUrl = await page.mainImage();
            return imageUrl;
        } catch(err) {
            return null;
        }
    }

    extractStreetName(streetName, lang = "uk") {
        return streetName.replace(constants.regexp[lang].streetType, "").trim();
    }

    isPersonCategory(categories, lang = "uk") {
        return categories.indexOf(constants.categories[lang].PEOPLE_STREETS_NAMED_AFTER) !== -1;
    }

    formatText(text, maxLength) {
        const formattedText = text.replace(/\n|\t/g, "");
        return formattedText.length < maxLength - 3 ? formattedText : formattedText.substring(0, maxLength - 3) + "...";
    }
}

module.exports = StreetWikiService;