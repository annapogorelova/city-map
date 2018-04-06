"use strict";
const wiki = require("wikijs").default;

class WikiApiService {
    constructor() {
        this.wikiApiUrl = "https://[lang].wikipedia.org/w/api.php";
    }

    async search(title, lang = "uk", limit = null) {
        const apiUrl = this.wikiApiUrl.replace("[lang]", lang);
        return wiki({apiUrl: apiUrl}).search(title, limit);
    }

    async getPage(title, lang = "uk") {
        const apiUrl = this.wikiApiUrl.replace("[lang]", lang);
        return wiki({apiUrl: apiUrl}).page(title);
    }
}

module.exports = WikiApiService;