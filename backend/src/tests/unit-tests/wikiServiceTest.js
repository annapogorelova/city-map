"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/wikiTestData");
const sinon = require("sinon");
const WikiApiService = require("../../lib/wiki/wikiApiService");
const WikiService = require("../../lib/wiki/wikiService");
const wikiServiceUtils = require("../../lib/wiki/wikiUtils");

function getPage(searchKey) {
    return testData.pages.filter(p => {return p.searchKey === searchKey})[0];
}

function getStreets(isNamedAfterEntity = false) {
    return testData.streets.filter(p => {
        return p.isNamedAfterEntity === isNamedAfterEntity;
    });
}

function getStreetSearchKey(street) {
    return `${street.streetName} (${street.cityName})`;
}

describe("wiki service test", () => {
    let wikiApiService, wikiService;
    const lang = "uk";

    function makeStreetStubs(streetPage, namedEntityPage) {
        let searchStub = sinon.stub(wikiApiService, "search")
            .onFirstCall().returns({results: streetPage.searchResults});

        if(namedEntityPage) {
            searchStub.onSecondCall().returns({results: namedEntityPage.searchResults})
        }

        let streetPageStub = {
            raw: {
                fullurl: streetPage.page.fullUrl
            },
            summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
            categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
            mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
        };

        let getStub = sinon.stub(wikiApiService, 'getPage')
            .onFirstCall().returns(streetPageStub);

        if(namedEntityPage) {
            let namedEntityPageStub = {
                raw: {
                    fullurl: namedEntityPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(namedEntityPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(namedEntityPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(namedEntityPage.page.imageUrl)),
            };

            getStub.onSecondCall().returns(namedEntityPageStub);
        }
    }

    beforeEach((done) => {
        wikiApiService = new WikiApiService();
        wikiService = new WikiService(wikiApiService);
        done();
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

            const result = await wikiService.getStreetInfo(testPage.key, testStreet.cityName);

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

            makeStreetStubs(streetPage, namedEntityPage);

            const result = await wikiService.getStreetInfo(streetPage.key, testStreet.cityName);

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

            makeStreetStubs(streetPage, namedEntityPage);

            const result = await wikiService.getStreetInfo(streetPage.searchKey, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.content, result.namedEntity.description);
            assert.equal(result.namedEntity.imageUrl, null);
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