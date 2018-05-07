const constants = require("../../app/constants/common");
const utils = require("../../app/utils");
const {optional} = require("tooleks");

module.exports = {
    // wikijs mainImage function override
    mainImage(page) {
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
                            return constants.images.indexOf(k) !== -1;
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

    formatText(text, maxLength) {
        if(!text) {
            return text;
        }

        const formattedText = text.replace(/\n|\t/g, " ").replace(constants.wikiSummaryCleanRegex, "").trim();
        const croppedText = formattedText.length < maxLength - 3 ? formattedText : formattedText.substring(0, maxLength - 3);
        if(croppedText[croppedText.length - 1] === ".") {
            return croppedText;
        }

        const lastIndex = croppedText.lastIndexOf(". ");
        return (lastIndex !== -1 && lastIndex < croppedText.length) ?
            croppedText.substring(0, lastIndex + 1) : `${croppedText}...`;
    },

    isNamedEntityCategory(categories) {
        const normalizedCategories = categories.map(c => this.normalizeCategoryName(c));

        return constants.namedEntityCategories.some(category => {
            return normalizedCategories.some(c =>
                category.strictComparison ? c === category.name : c.startsWith(category.name));
        });
    },

    isStreetCategory(categories) {
        return this.isCategory(categories);
    },

    isCategory(categories) {
        const categoryPrefix = constants.STREET_CATEGORY_PREFIX;
        return categories.filter(c => {
            return this.normalizeCategoryName(c).startsWith(categoryPrefix);
        }).length > 0;
    },

    normalizeCategoryName(categoryName) {
        return categoryName.replace(constants.CATEGORY_PREFIX, "");
    },

    filterValidStreetResults(search, results) {
        const streetResults = results.filter(r => r.match(constants.streetArticleTitleRegex));
        if(!streetResults.length) {
            return streetResults;
        }

        return streetResults.filter(result => this.streetNamesMatch(search, result));
    },

    findGeneralStreetArticle(search, results) {
        return optional(() => results
            .filter(r => r.match(constants.generalStreetArticleTitleRegex))[0], undefined);
    },

    streetNamesMatch(search, result, threshold = 5) {
        return utils.extractStreetName(result).startsWith(utils.extractStreetName(search).substring(0, threshold));
    }
};