"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/wikiTestData");
const sinon = require("sinon");
const WikiService = require("../../lib/wiki/wikiService");
const StreetWikiService = require("../../lib/wiki/streetWikiService");
const streetWikiServiceUtils = require("../../lib/wiki/utils");
const constants = require("../../lib/wiki/constants");

function getPage(key) {
    return testData.pages.filter(p => {return p.searchKey === key})[0];
}

function getStreets(isNamedAfterPerson = false) {
    return testData.streets.filter(p => {return p.isNamedAfterPerson === isNamedAfterPerson;});
}

function getStreetSearchKey(street) {
    return `${street.streetName} (${street.cityName})`;
}

describe("wiki service test", () => {
    it("should return only description of the street (it's not named after anybody)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const testStreet = getStreets()[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const namedAfterTitle = streetWikiServiceUtils.extractStreetName(testStreet.streetName);
            const personPage = getPage(namedAfterTitle);

            sinon.stub(wikiService, "search")
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: personPage.searchResults});

            let personPageStub = {
                raw: {
                    fullurl: personPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(personPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(personPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(personPage.page.imageUrl)),
            };

            let streetPageStub = {
                raw: {
                    fullurl: streetPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
            };

            sinon.stub(wikiService, 'getPage')
                .onFirstCall().returns(streetPageStub)
                .onSecondCall().returns(personPageStub);

            const result = await streetWikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.notExists(result.person);
            done();
        })();
    });

    it("should return street wiki page description (not named after)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets()[0];
            const testPage = getPage(getStreetSearchKey(testStreet));
            sinon.stub(wikiService, 'search')
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
            sinon.stub(wikiService, 'getPage').returns(pageStub);

            const result = await streetWikiService.getStreetInfo(testPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(testPage.page.content, result.street.description);
            assert.notExists(result.person);
            done();
        })();
    });

    it("should return the description of the street (named after)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = streetWikiServiceUtils.extractStreetName(testStreet.streetName);
            const personPage = getPage(title);

            sinon.stub(wikiService, 'search')
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: personPage.searchResults});

            let personPageStub = {
                raw: {
                    fullurl: personPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(personPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(personPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(personPage.page.imageUrl)),
            };

            let streetPageStub = {
                raw: {
                    fullurl: streetPage.imageUrl
                },
                summary: sinon.stub().returns(Promise.resolve(streetPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(streetPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(streetPage.page.imageUrl)),
            };

            sinon.stub(wikiService, 'getPage')
                .onFirstCall().returns(streetPageStub)
                .onSecondCall().returns(personPageStub);

            const result = await streetWikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.exists(result.person);
            assert.equal(personPage.page.content, result.person.description);
            done();
        })();
    });

    it("should not return the content of non existing article", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const testStreet = getStreets(true)[0];
            sinon.stub(wikiService, 'search').returns({results: []});

            const result = await streetWikiService.getStreetInfo(testStreet.streetName, testStreet.cityName);
            assert.exists(result);
            assert.exists(result.street);
            assert.equal(result.street.description, null);
            assert.notExists(result.person);
            done();
        })();
    });

    it("should not return the content of the non existing page (getPageContent method)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const result = await streetWikiService.getPage("Not Found");
            assert.isNull(result);
            done();
        })();
    });

    it("should return null in place of imageUrl when images from wiki throw error (a wikijs bug)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = streetWikiServiceUtils.extractStreetName(testStreet.streetName);
            const personPage = getPage(title);

            sinon.stub(wikiService, 'search')
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: personPage.searchResults});

            let personPageStub = {
                raw: {
                    fullurl: personPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(personPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(personPage.page.categories)),
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

            sinon.stub(wikiService, 'getPage')
                .onFirstCall().returns(streetPageStub)
                .onSecondCall().returns(personPageStub);

            const result = await streetWikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(streetPage.page.content, result.street.description);
            assert.exists(result.person);
            assert.equal(personPage.page.content, result.person.description);
            assert.equal(result.person.imageUrl, null);
            done();
        })();
    });

    it("should not use the street description if the page is no of street category", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const testStreet = getStreets(true)[0];
            let streetPage = Object.assign({}, getPage(getStreetSearchKey(testStreet)));
            // Remove street category
            streetPage.page.categories = streetPage.page.categories.filter(c => {
                return !c.startsWith(constants.categories["uk"].STREET_CATEGORY_PREFIX);
            });

            sinon.stub(wikiService, 'search')
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

            sinon.stub(wikiService, 'getPage').returns(streetPageStub);
            const result = await streetWikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.exists(result.street);
            assert.equal(result.street.description, null);
            done();
        })();
    });
});