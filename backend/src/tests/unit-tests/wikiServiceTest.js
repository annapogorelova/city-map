"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/wikiTestData");
const sinon = require("sinon");
const WikiApiService = require("../../lib/wiki/wikiApiService");
const WikiService = require("../../lib/wiki/wikiService");
const wikiServiceUtils = require("../../lib/wiki/wikiUtils");
const constants = require("../../lib/wiki/constants");

function getPage(key) {
    return testData.pages.filter(p => {return p.searchKey === key})[0];
}

function getStreets(isNamedAfterEntity = false) {
    return testData.streets.filter(p => {return p.isNamedAfterPerson === isNamedAfterEntity;});
}

function getStreetSearchKey(street) {
    return `${street.streetName} (${street.cityName})`;
}

describe("wiki service test", () => {
    let wikiApiService, wikiService;

    beforeEach((done) => {
        wikiApiService = new WikiApiService();
        wikiService = new WikiService(wikiApiService);
        done();
    });

    it("should return only description of the street (it's not named after anybody)", (done) => {
        (async () => {
            const testStreet = getStreets()[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const namedAfterTitle = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(namedAfterTitle);

            sinon.stub(wikiApiService, "search")
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: namedEntityPage.searchResults});

            let namedEntityPageStub = {
                raw: {
                    fullurl: namedEntityPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(namedEntityPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(namedEntityPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(namedEntityPage.page.imageUrl)),
            };

            let streetPageStub = {
                raw: {
                    fullurl: streetPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
            };

            sinon.stub(wikiApiService, 'getPage')
                .onFirstCall().returns(streetPageStub)
                .onSecondCall().returns(namedEntityPageStub);

            const result = await wikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.notExists(result.namedEntity);
            done();
        })();
    });

    it("should return street wiki page description (not named after)", (done) => {
        (async () => {
            const testStreet = getStreets()[0];
            const testPage = getPage(getStreetSearchKey(testStreet));
            sinon.stub(wikiApiService, 'search')
                .onFirstCall().returns({results: testPage.searchResults})
                .onSecondCall().returns({results: []});
            let pageStub = {
                raw: {
                    fullurl: testPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(testPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(testPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(testPage.page.imageUrl)),
            };
            sinon.stub(wikiApiService, 'getPage').returns(pageStub);

            const result = await wikiService.getStreetInfo(testPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(testPage.page.content, result.street.description);
            assert.notExists(result.namedEntity);
            done();
        })();
    });

    it("should return the description of the street (named after)", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);

            sinon.stub(wikiApiService, 'search')
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: namedEntityPage.searchResults});

            let namedEntityPageStub = {
                raw: {
                    fullurl: namedEntityPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(namedEntityPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(namedEntityPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(namedEntityPage.page.imageUrl)),
            };

            let streetPageStub = {
                raw: {
                    fullurl: streetPage.imageUrl
                },
                summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
            };

            sinon.stub(wikiApiService, 'getPage')
                .onFirstCall().returns(streetPageStub)
                .onSecondCall().returns(namedEntityPageStub);

            const result = await wikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.content, result.namedEntity.description);
            done();
        })();
    });

    it("should not return the content of non existing article", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            sinon.stub(wikiApiService, 'search').returns({results: []});

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);
            assert.exists(result);
            assert.notExists(result.street);
            assert.notExists(result.namedEntity);
            done();
        })();
    });

    it("should not return the content of the non existing page (getPageContent method)", (done) => {
        (async () => {
            try {
                await wikiApiService.getPage("Not Found");
            } catch(err) {
                assert(err);
                done();
            }
        })();
    });

    it("should return null in place of imageUrl when images from wiki throw error (a wikijs bug)", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);

            sinon.stub(wikiApiService, 'search')
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: namedEntityPage.searchResults});

            let namedEntityPageStub = {
                raw: {
                    fullurl: namedEntityPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(namedEntityPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(namedEntityPage.page.categories)),
                mainImage: sinon.stub().throws(),
            };

            let streetPageStub = {
                raw: {
                    fullurl: streetPage.imageUrl
                },
                summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
            };

            sinon.stub(wikiApiService, 'getPage')
                .onFirstCall().returns(streetPageStub)
                .onSecondCall().returns(namedEntityPageStub);

            const result = await wikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.content, result.namedEntity.description);
            assert.equal(result.namedEntity.imageUrl, null);
            done();
        })();
    });

    it("should not use the street description if the page is no of street category", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            let streetPage = Object.assign({}, getPage(getStreetSearchKey(testStreet)));
            // Remove street category
            streetPage.page.categories = streetPage.page.categories.filter(c => {
                return !c.startsWith(constants["uk"].STREET_CATEGORY_PREFIX);
            });

            sinon.stub(wikiApiService, 'search')
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: []});

            let streetPageStub = {
                raw: {
                    fullurl: streetPage.imageUrl
                },
                summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
            };

            sinon.stub(wikiApiService, 'getPage').returns(streetPageStub);
            const result = await wikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.notExists(result.street);
            done();
        })();
    });

    it("getPage should return null when error is thrown by wikiApiService", (done) => {
        (async () => {
            sinon.stub(wikiApiService, 'getPage').throws();
            const result = await wikiService.getPage("5th Avenue");
            assert.isNull(result);
            done();
        })();
    });
});