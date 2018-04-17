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

function getGeneralStreetPage(streetName) {
    return testData.pages.filter(p => p.key === streetName)[0];
}

describe("wiki service test", () => {
    let wikiApiService, wikiService, searchStub, getPageStub;

    function configurePageStub(page, searchStub, getPageStub, searchCallIndex, getPageCallIndex) {
        searchStub.onCall(searchCallIndex).returns({results: page.searchResults});

        let pageData = {
            raw: {
                fullurl: page.page.fullUrl
            },
            summary: sinon.stub().returns(Promise.resolve(page.page.summary)), // summary must be separated
            content: sinon.stub().returns(Promise.resolve(page.page.content)),
            categories: sinon.stub().returns(Promise.resolve(page.page.categories)),
            mainImage: sinon.stub().returns(Promise.resolve(page.page.imageUrl)),
        };

        getPageStub.onCall(getPageCallIndex).returns(pageData);
    }

    beforeEach((done) => {
        wikiApiService = new WikiApiService();
        wikiService = new WikiService(wikiApiService);
        searchStub = sinon.stub(wikiApiService, "search");
        getPageStub = sinon.stub(wikiApiService, "getPage");

        done();
    });

    afterEach((done) => {
        if(searchStub && typeof searchStub.search !== "undefined") {
            searchStub.search.restore();
        }

        if(getPageStub && typeof searchStub.getPage !== "undefined") {
            getPageStub.getPage.restore();
        }

        done();
    });

    it("should not return the description of the street: " +
        "1. street page NOT FOUND" +
        "2. general street page NOT FOUND" +
        "3. named entity page NOT FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];

            searchStub.onCall(0).returns({results: []});
            searchStub.onCall(1).returns({results: []});
            searchStub.onCall(2).returns({results: []});

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.notExists(result.street);
            assert.notExists(result.namedEntity);

            done();
        })();
    });

    it("should not return the description of the street: " +
        "1. street page NOT FOUND" +
        "2. general street page FOUND with REFERENCE", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);
            const generalStreetPage = getGeneralStreetPage(testStreet.streetName);

            searchStub.onCall(0).returns({results: []});
            configurePageStub(generalStreetPage, searchStub, getPageStub, 1, 0);
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 1);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.notExists(result.street);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.summary, result.namedEntity.description);

            done();
        })();
    });

    it("should not return the description of the street: " +
        "1. street page NOT FOUND" +
        "2. general street page NOT FOUND" +
        "3. named entity page FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);

            searchStub.onCall(0).returns({results: []});
            searchStub.onCall(1).returns({results: []});
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 0);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.notExists(result.street);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.summary, result.namedEntity.description);

            done();
        })();
    });

    it("should return the description of the street:" +
        "1. street page FOUND" +
        "2. general street page FOUND with REFERENCE", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);
            const generalStreetPage = getGeneralStreetPage(testStreet.streetName);

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            configurePageStub(generalStreetPage, searchStub, getPageStub, 1, 1);
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 2);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.summary, result.namedEntity.description);
            done();
        })();
    });

    it("should return the description of the street (" +
        "1. street page FOUND" +
        "2. general street page FOUND (NO REFERENCE)" +
        "3. named entity page FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);
            let generalStreetPage = Object.assign({}, getGeneralStreetPage(testStreet.streetName));
            generalStreetPage.summary = "";

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            configurePageStub(generalStreetPage, searchStub, getPageStub, 1, 1);
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 2);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.summary, result.namedEntity.description);
            done();
        })();
    });

    it("should return the description of the street (" +
        "1. street page FOUND" +
        "2. general street page NOT FOUND" +
        "3. named entity page FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            searchStub.onCall(1).returns({results: []});
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 1);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.summary, result.namedEntity.description);
            done();
        })();
    });

    it("should return the description of the street (" +
        "1. street page FOUND" +
        "2. general street page NOT FOUND" +
        "3. named entity page NOT FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            searchStub.onCall(1).returns({results: []});
            searchStub.onCall(2).returns({results: []});

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.notExists(result.namedEntity);
            done();
        })();
    });

    it("should return the description of the street (" +
        "1. street page FOUND" +
        "2. general street page FOUND, NOT VALID" +
        "3. named entity page FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            // Another street's general page
            const generalStreetPage = getGeneralStreetPage(getStreets()[0].streetName);
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            searchStub.onCall(1).returns({results: [generalStreetPage]});
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 1);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.exists(result.namedEntity);
            assert.equal(namedEntityPage.page.summary, result.namedEntity.description);
            done();
        })();
    });

    it("should return the description of the street (" +
        "1. street page FOUND" +
        "2. general street page FOUND, NOT VALID" +
        "3. named entity page NOT FOUND", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            // Another street's general page
            const generalStreetPage = getGeneralStreetPage(getStreets()[0].streetName);

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            configurePageStub(generalStreetPage, searchStub, getPageStub, 1, 1);
            searchStub.onCall(2).returns({results: []});

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.notExists(result.namedEntity);
            done();
        })();
    });

    it("should return the description of the street (" +
        "1. street page FOUND" +
        "2. general street page NOT FOUND" +
        "3. named entity page FOUND, NOT VALID", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = wikiServiceUtils.extractStreetName(testStreet.streetName);
            const namedEntityPage = Object.assign({}, getPage(title));
            namedEntityPage.searchResults = ["Андрій Симко"];
            // This result will not pass by category
            //namedEntityPage.page.categories = ["Люди, на честь яких не названі вулиці"];

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);
            searchStub.onCall(1).returns({results: []});
            configurePageStub(namedEntityPage, searchStub, getPageStub, 2, 1);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.summary, result.street.description);
            assert.notExists(result.namedEntity);
            done();
        })();
    });
});