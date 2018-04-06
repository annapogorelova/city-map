const constants = require("./constants");
const {optional} = require("tooleks");

module.exports = {
    // wikijs mainImage function override
    mainImage(page, lang = "uk") {
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
                            return constants.propNames[lang].images.indexOf(k) !== -1;
                        })
                        .map((k) => info[k])[0],
                undefined);

                const mainImageName = _getFileName(
                    info.image ||
                    info.logo ||
                    extractedImage
                );

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
        if(!constants.regexp[lang]) {
            throw Error(`${lang} language is not supported`);
        }

        const regex = new RegExp(`${constants.regexp[lang].streetTypes.join("|")}`, "ig");
        return streetName.replace(regex, "").trim();
    },

    isPersonCategory(categories, lang = "uk") {
        const localizedCategories = constants.categories[lang];
        return categories.indexOf(localizedCategories.PEOPLE_STREETS_NAMED_AFTER) !== -1;
    },

    isStreetCategory(categories, lang = "uk") {
        const localizedCategories = constants.categories[lang];
        return categories.filter(c => {
            return c.startsWith(localizedCategories.STREET_CATEGORY_PREFIX);
        }).length > 0;
    },
};