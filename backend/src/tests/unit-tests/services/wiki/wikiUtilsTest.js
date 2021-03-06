"use strict";

const chai = require("chai");
const assert = chai.assert;
const wikiUtils = require("../../../../lib/wiki/wikiUtils");
const constants = require("../../../../app/constants/commonConstants");
const utils = require("../../../../app/utils");

describe("street wiki service utils unit test", function () {
    const testImagesInfo = [
        {
            imageinfo: [{
                descriptionshorturl: "https://commons.wikimedia.org/w/index.php?curid=582479",
                descriptionurl: "https://commons.wikimedia.org/wik…File:Lesya_Ukrainka_portrait.jpg",
                url: "https://upload.wikimedia.org/wiki…d/d5/Lesya_Ukrainka_portrait.jpg"
            }],
            imagerepository: "shared",
            known: "",
            missing: "",
            ns: 6,
            title: "Файл:Lesya Ukrainka portrait.jpg"
        },
        {
            imageinfo: [{
                descriptionshorturl: "https://uk.wikipedia.org/w/index.php?curid=773544",
                descriptionurl: "https://uk.wikipedia.org/wiki/%D0…0%BA%D0%BB%D0%B0%D0%B2%D1%96.jpg",
                url: "https://upload.wikimedia.org/wiki…0%BA%D0%BB%D0%B0%D0%B2%D1%96.jpg",
            }],
            imagerepository: "local",
            ns: 6,
            pageid: 773544,
            title: "Файл:Пам'ятник Лесі Українці в Балаклаві.jpg"
        }
    ];

    it("should extract the street name from the full title of the street", (done) => {
        const streetName = "Толочка";

        for(let streetType of constants.streetTypes) {
            const name = utils.extractStreetName(`${streetType} ${streetName}`);
            assert.equal(streetName, name);
        }

        done();
    });

    it("should check if category is a named entity category", (done) => {
        const namedEntityCategory = constants.namedEntityCategories[0].name;
        assert.isTrue(wikiUtils.isNamedEntityCategory([namedEntityCategory]));
        assert.isFalse(wikiUtils.isNamedEntityCategory([]));
        assert.isFalse(wikiUtils.isNamedEntityCategory(["Тварина"]));
        done();
    });

    it("isNamedEntityCategory should return true for categories which names start with the valid category", (done) => {
        const namedEntityCategory = `${constants.namedEntityCategories[0].name} Саша`;
        assert.isTrue(wikiUtils.isNamedEntityCategory([namedEntityCategory]));
        done();
    });

    it("should check if category is a street category", (done) => {
        const streetCategory = constants.STREET_CATEGORY_PREFIX;
        assert.isTrue(wikiUtils.isStreetCategory([streetCategory]));
        assert.isFalse(wikiUtils.isNamedEntityCategory([]));
        assert.isFalse(wikiUtils.isNamedEntityCategory(["Тварина"]));
        done();
    });

    it("mainImage should return the 'фото' property value", (done) => {
        (async () => {
            const page = {
                rawImages: function() {
                    return Promise.resolve(testImagesInfo);
                },
                info: function() {
                    return Promise.resolve({
                        "фото": testImagesInfo[0].title
                    });
                }
            };

            const result = await wikiUtils.mainImage(page);
            assert.equal(result, testImagesInfo[0].imageinfo[0].url);

            done();
        })();
    });

    it("mainImage should return the 'портрет' property value", (done) => {
        (async () => {
            const page = {
                rawImages: function() {
                    return Promise.resolve(testImagesInfo);
                },
                info: function() {
                    return Promise.resolve({
                        "портрет": testImagesInfo[0].title
                    });
                }
            };

            const result = await wikiUtils.mainImage(page);
            assert.equal(result, testImagesInfo[0].imageinfo[0].url);

            done();
        })();
    });

    it("filterValidStreetResults should return the single valid street article title", (done) => {
        const streetName = "Толочка";
        const cityName = "Толочава";
        const streetType = constants.streetTypes[0];
        const articleTitle = `${streetType} ${streetName} (${cityName})`;

        const results = wikiUtils.filterValidStreetResults(articleTitle, [articleTitle]);
        assert.equal(1, results.length);
        assert.equal(articleTitle, results[0]);
        done();
    });

    it("filterValidStreetResults should return empty array (no valid matches)", (done) => {
        const streetName = "Толочка";
        const cityName = "Толочава";
        const streetType = constants.streetTypes[0];
        const articleTitle = `${streetType} ${streetName} (${cityName})`;
        const invalidResults = [`${streetType} ${streetName}`, "Дж. Р. Р. Толкіен", `${cityName}`];

        const results = wikiUtils.filterValidStreetResults(articleTitle, invalidResults);
        assert.equal(0, results.length);
        done();
    });

    it("normalizeCategoryName should remove the category prefix", (done) => {
        const category = "Поети";
        const categoryName = `${constants.CATEGORY_PREFIX}${category}`;
        const result = wikiUtils.normalizeCategoryName(categoryName);
        assert.equal(category, result);
        done();
    });

    it("streetNamesMatch should return true when street type word appears in " +
        "different order in search and result", (done) => {
        const search = `${constants.streetTypes[0]} Толочка`;
        const result = `Толочка ${constants.streetTypes[0]}`;
        const matches = wikiUtils.streetNamesMatch(search, result);
        assert.isTrue(matches);
        done();
    });

    it("streetNamesMatch should compare strings up to the specified threshold", (done) => {
        const base = "Толочко ";
        const search = `${base}Олександр`;
        const result = `${base}Сашко`;
        const matches = wikiUtils.streetNamesMatch(search, result, base.length + 1);
        assert.isFalse(matches);
        done();
    });
});