const {optional} = require("tooleks");
const utils = require("./utils");

class StreetWikiService {
    constructor(wikiService) {
        this.wikiService = wikiService;
    }

    async getStreetInfo(streetName, cityName, maxLength = 500, lang = "uk") {
        const [streetInfo, personInfo] = await Promise.all([
            this.getWikiInfo(streetName, cityName, lang),
            this.getPersonWikiInfo(streetName, lang)
        ]);

        let result = {
            street: {
                wikiUrl: optional(() => streetInfo.wikiUrl, null),
                description: optional(() => utils.isStreetCategory(streetInfo.categories) ?
                    utils.formatText(streetInfo.content, maxLength) : null, null)
            }
        };

        if (!personInfo) {
            return result;
        }

        const categories = personInfo.categories;

        if (utils.isPersonCategory(categories, lang)) {
            result["person"] = {
                name: personInfo.title,
                description: optional(() => utils.formatText(personInfo.content, maxLength), ""),
                imageUrl: personInfo.imageUrl,
                wikiUrl: personInfo.wikiUrl
            };
        }

        return result;
    }

    async getWikiInfo(streetName, cityName, lang = "uk") {
        return this.searchArticle(`${streetName} (${cityName})`, lang);
    }

    async getPersonWikiInfo(streetName, lang = "uk") {
        const title = utils.extractStreetName(streetName, lang);
        return this.searhPersonArticle(title, lang);
    }

    async searchArticle(articleName, lang) {
        const searchResult = await this.wikiService.search(articleName, lang, 1);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        return this.getPage(searchResult.results[0]);
    }

    async searhPersonArticle(articleName, lang) {
        const searchResult = await this.wikiService.search(articleName, lang, 20);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        for(let result of searchResult.results) {
            let page = await this.getPage(result);
            if(page && page.categories && utils.isPersonCategory(page.categories)) {
                return page;
            }
        }

        return null;
    }

    async getPage(title) {
        try {
            const page = await this.wikiService.getPage(title);
            const pageContent = await Promise.all([
                optional(() => page.summary(), ""),
                optional(() => page.categories(), []),
                optional(() => utils.mainImage(page), null)
            ]);
            return {
                title: title,
                content: pageContent[0],
                categories: pageContent[1],
                imageUrl: pageContent[2],
                wikiUrl: optional(() => page.raw.fullurl, "")
            };
        } catch (err) {
            return null;
        }
    }
}

module.exports = StreetWikiService;