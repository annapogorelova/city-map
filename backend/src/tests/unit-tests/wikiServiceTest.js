"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/wikiTestData");
const sinon = require("sinon");
const WikiApiService = require("../../lib/wiki/wikiApiService");
const WikiService = require("../../lib/wiki/wikiService");
const utils = require("../../app/utils");
const stringUtils = require("../../lib/wiki/stringUtils");

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

    function getPageStubData(page) {
        return {
            raw: page.page.raw,
            summary: sinon.stub().resolves(stringUtils.cleanText(page.page.summary)),
            content: sinon.stub().resolves(stringUtils.cleanText(page.page.content)),
            categories: sinon.stub().resolves(page.page.categories),
            mainImage: sinon.stub().resolves(page.page.imageUrl),
        };
    }

    function configurePageStub(page, searchStub, getPageStub, searchCallIndex, getPageCallIndex) {
        searchStub.onCall(searchCallIndex).resolves({results: page.searchResults});
        getPageStub.onCall(getPageCallIndex).resolves(getPageStubData(page));
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

    it("should not return the description of the street: (street page not found)", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            searchStub.onCall(0).returns({results: []});
            searchStub.onCall(1).returns({results: []});

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);
            assert.isNull(result);

            done();
        })();
    });

    it("should return the description of the street", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));

            configurePageStub(streetPage, searchStub, getPageStub, 0, 0);

            const result = await wikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.equal(streetPage.page.wikiUrl, result.wikiUrl);
            assert.equal(streetPage.page.summary, result.description);

            done();
        })();
    });

    it("should not return the named entity (general street page found)", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const title = utils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);
            const generalStreetPage = getGeneralStreetPage(testStreet.streetName);

            configurePageStub(generalStreetPage, searchStub, getPageStub, 0, 0);
            getPageStub.onCall(1).resolves(getPageStubData(namedEntityPage));

            const result = await wikiService.getNamedEntityInfo(testStreet.streetName);

            assert.exists(result);
            assert.equal(stringUtils.cleanText(namedEntityPage.page.summary), result.description);
            assert.equal(namedEntityPage.page.wikiUrl, result.wikiUrl);
            assert.exists(result.tags);
            assert.isNotEmpty(result.tags);

            done();
        })();
    });

    it("should not return the named entity (general street page found without named entity info)",
        (done) => {
            (async () => {
                const testStreet = getStreets(true)[0];
                const title = utils.extractStreetName(testStreet.streetName);
                const namedEntityPage = getPage(title);
                const generalStreetPage = Object.assign({}, getGeneralStreetPage(testStreet.streetName));
                generalStreetPage.summary = "";

                configurePageStub(generalStreetPage, searchStub, getPageStub, 0, 0);
                configurePageStub(namedEntityPage, searchStub, getPageStub, 1, 1);

                const result = await wikiService.getNamedEntityInfo(testStreet.streetName);

                assert.exists(result);
                assert.equal(stringUtils.cleanText(namedEntityPage.page.summary), result.description);
                assert.equal(namedEntityPage.page.wikiUrl, result.wikiUrl);
                assert.exists(result.tags);
                assert.isNotEmpty(result.tags);

                done();
            })();
        });

    it("should not return the named entity (general street page not found)", (done) => {
        (async () => {
            const testStreet = getStreets(true)[0];
            const title = utils.extractStreetName(testStreet.streetName);
            const namedEntityPage = getPage(title);

            searchStub.onCall(0).returns({results: []});
            configurePageStub(namedEntityPage, searchStub, getPageStub, 1, 0);

            const result = await wikiService.getNamedEntityInfo(testStreet.streetName);

            assert.exists(result);
            assert.equal(stringUtils.cleanText(namedEntityPage.page.summary), result.description);
            assert.equal(namedEntityPage.page.wikiUrl, result.wikiUrl);

            done();
        })();
    });
});