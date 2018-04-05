"use strict";

const chai = require("chai");
const assert = chai.assert;
const streetWikiServiceUtils = require("../../lib/wiki/utils");
const constants = require("../../lib/wiki/constants");

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

    it("should crop the wiki content text", (done) => {
        const maxLength = 50;
        let text = "koko\n\t";
        for(let i = 0; i < 20; i++) {
            text += "koko\n\t";
        }
        const formattedText = streetWikiServiceUtils.formatText(text, maxLength);
        assert.equal(formattedText.length, maxLength);
        assert.equal(formattedText.indexOf("\n"), -1);
        done();
    });

    it("should return text value when text is empty or null", (done) => {
        const maxLength = 50;
        let formattedText = streetWikiServiceUtils.formatText("", maxLength);
        assert.equal(formattedText, "");
        formattedText = streetWikiServiceUtils.formatText(null, maxLength);
        assert.equal(formattedText, null);
        done();
    });

    it("should extract the street name from the full title of the street", (done) => {
        const streetName = "Толочка";

        for(let streetType of constants.regexp["uk"].streetTypes) {
            const name = streetWikiServiceUtils.extractStreetName(`${streetType} ${streetName}`);
            assert.equal(streetName, name);
        }

        done();
    });

    it("should throw Error when extractStreetName is called with invalid language", (done) => {
        const streetTitle = "Вулиця Толочка";
        try {
            streetWikiServiceUtils.extractStreetName(streetTitle, "de");
        } catch(err) {
            assert(err);
        }
        done();
    });

    it("should check if category is a person category", (done) => {
        const personCategory = constants.categories["uk"].PEOPLE_STREETS_NAMED_AFTER;
        assert.isTrue(streetWikiServiceUtils.isPersonCategory([personCategory]));
        assert.isFalse(streetWikiServiceUtils.isPersonCategory([]));
        assert.isFalse(streetWikiServiceUtils.isPersonCategory(["Тварина"]));
        done();
    });

    it("should check if category is a street category", (done) => {
        const streetCategory = constants.categories["uk"].STREET_CATEGORY_PREFIX;
        assert.isTrue(streetWikiServiceUtils.isStreetCategory([streetCategory]));
        assert.isFalse(streetWikiServiceUtils.isPersonCategory([]));
        assert.isFalse(streetWikiServiceUtils.isPersonCategory(["Тварина"]));
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

            const result = await streetWikiServiceUtils.mainImage(page);
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

            const result = await streetWikiServiceUtils.mainImage(page);
            assert.equal(result, testImagesInfo[0].imageinfo[0].url);

            done();
        })();
    });
});