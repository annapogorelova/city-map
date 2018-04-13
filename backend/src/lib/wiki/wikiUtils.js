const constants = require("./constants");
const {optional} = require("tooleks");

module.exports = {
    // wikijs mainImage function override
    mainImage(page, lang = "uk") {
        this.validateLanguage(lang);

        const _getFileName = text => {
            if (!text) return undefined;
            if (text.indexOf(":") !== -1) {
                const [, name] = text.split(":");
                return name;
            }
            return text;
        };

        return Promise.all([page.rawImages(), page.info()])
            .then(([images, info]) => {
                const extractedImage = optional(() =>
                    Object.keys(info)
                        .filter(k => {
                            return constants[lang].images.indexOf(k) !== -1;
                        })
                        .map((k) => info[k])[0],
                undefined);

                const mainImageName = optional(() => _getFileName(
                    info.image ||
                    info.logo ||
                    extractedImage
                ), undefined);

                if (!mainImageName) {
                    return page.rawInfo().then(text => {
                        if (!images.length) return undefined;
                        images.sort((a, b) => text.indexOf(b.title) - text.indexOf(a.title));
                        const image = images[0];
                        return image.imageinfo.length > 0
                            ? image.imageinfo[0].url
                            : undefined;
                    });
                }
                const image = images.find(({title}) => {
                    const filename = _getFileName(title);
                    return filename === mainImageName ||
                        filename.replace(/\s/g, "_") === mainImageName;
                });
                return image && image.imageinfo.length > 0
                    ? image.imageinfo[0].url
                    : undefined;
            });
    },

    formatText(text, maxLength = 50) {
        if(!text) {
            return text;
        }
        const formattedText = text.replace(/\n|\t/g, " ");
        return formattedText.length < maxLength - 3 ? formattedText : formattedText.substring(0, maxLength - 3) + "...";
    },

    extractStreetName(streetName, lang = "uk") {
        this.validateLanguage(lang);

        const regex = new RegExp(`${constants[lang].streetTypes.join("|")}`, "ig");
        return streetName.replace(regex, "").trim();
    },

    isNamedEntityCategory(categories, lang = "uk") {
        this.validateLanguage(lang);

        const normalizedCategories = categories.map(c => this.normalizeCategoryName(c, lang));
        const localizedConstants = constants[lang].namedEntityCategories.map(c => c.name);

        return localizedConstants.some(category => {
            return normalizedCategories.some(c => c.startsWith(category));
        });
    },

    isStreetCategory(categories, lang = "uk") {
        this.validateLanguage(lang);

        return this.isCategory(categories, lang);
    },

    isCategory(categories, lang) {
        const categoryPrefix = constants[lang].STREET_CATEGORY_PREFIX;
        return categories.filter(c => {
            return this.normalizeCategoryName(c,lang).startsWith(categoryPrefix);
        }).length > 0;
    },

    normalizeCategoryName(categoryName, lang) {
        this.validateLanguage(lang);
        return categoryName.replace(constants[lang].CATEGORY_PREFIX, "");
    },

    filterValidStreetResults(search, results, lang) {
        this.validateLanguage(lang);

        const streetResults = results.filter(r => r.match(constants[lang].streetArticleTitleRegex));
        if(!streetResults.length) {
            return streetResults;
        }

        return streetResults.filter(result => this.streetNamesMatch(search, result));
    },

    streetNamesMatch(search, result, threshold = 5) {
        return this.extractStreetName(result).startsWith(this.extractStreetName(search).substring(0, threshold));
    },

    validateLanguage(lang) {
        if(!constants[lang]) {
            throw Error(`${lang} language is not supported`);
        }
    }
};