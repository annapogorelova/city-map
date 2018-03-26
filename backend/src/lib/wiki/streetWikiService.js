const constants = require("./constants");
const {optional} = require("tooleks");

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
                description: optional(() => this.isStreetCategory(streetInfo.categories) ?
                    this.formatText(streetInfo.content, maxLength) : null, null)
            }
        };

        if (!personInfo) {
            return result;
        }

        const categories = personInfo.categories;

        if (this.isPersonCategory(categories, lang)) {
            result["person"] = {
                name: personInfo.title,
                description: optional(() => this.formatText(personInfo.content, maxLength), ""),
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
        const title = this.extractStreetName(streetName, lang);
        return this.searhPersonArticle(title, lang);
    }

    async searchArticle(articleName, lang) {
        const searchResult = await this.wikiService.search(articleName, lang, 1);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        return this.getPage(searchResult.results[0])
    }

    async searhPersonArticle(articleName, lang) {
        const searchResult = await this.wikiService.search(articleName, lang, 20);
        if (!searchResult || !searchResult.results || !searchResult.results.length) {
            return null;
        }

        for(let result of searchResult.results) {
            let page = await this.getPage(result);
            if(page && page.categories && this.isPersonCategory(page.categories)) {
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
                optional(() => page.mainImage(), null)
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

    extractStreetName(streetName, lang = "uk") {
        return streetName.replace(constants.regexp[lang].streetType, "").trim();
    }

    isPersonCategory(categories, lang = "uk") {
        const localizedCategories = constants.categories[lang];
        return categories.indexOf(localizedCategories.PEOPLE_STREETS_NAMED_AFTER) !== -1;
    }

    isStreetCategory(categories, lang = "uk") {
        const localizedCategories = constants.categories[lang];
        return categories.filter(c => {
            return c.startsWith(localizedCategories.STREET_CATEGORY_PREFIX);
        }).length > 0;
    }

    formatText(text, maxLength = 50) {
        if(!text) {
            return text;
        }
        const formattedText = text.replace(/\n|\t/g, " ");
        return formattedText.length < maxLength - 3 ? formattedText : formattedText.substring(0, maxLength - 3) + "...";
    }
}

module.exports = StreetWikiService;