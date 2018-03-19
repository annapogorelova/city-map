"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/wikiTestData");
const sinon = require("sinon");
const WikiService = require("../../lib/wiki/wikiService");
const StreetWikiService = require("../../lib/wiki/streetWikiService");

function getPage(key) {
    return testData.pages.filter(p => {return p.searchKey === key})[0];
}

function getStreets(isNamedAfterPerson = false) {
    return testData.streets.filter(p => {return p.isNamedAfterPerson === isNamedAfterPerson;});
}

function getStreetSearchKey(street) {
    return `${street.streetName} (${street.cityName})`;
}

function stubWikiService(wikiService, key) {
    const testPage = getPage(key);
    sinon.stub(wikiService, 'search').returns({results: testPage.searchResults});

    let pageStub = {
        raw: {
            fullurl: testPage.page.fullUrl
        },
        summary: sinon.stub().returns(Promise.resolve(testPage.page.content)),
        categories: sinon.stub().returns(Promise.resolve(testPage.page.categories)),
        mainImage: sinon.stub().returns(Promise.resolve(testPage.page.imageUrl))
    };
    sinon.stub(wikiService, 'getPage').returns(pageStub);
    return testPage;
}

describe("wiki service test", () => {
    it("should return only description of the street (it's not named after anybody)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const testStreet = getStreets()[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const namedAfterTitle = streetWikiService.extractStreetName(testStreet.streetName);
            const namedAfterPage = getPage(namedAfterTitle);

            sinon.stub(wikiService, "search")
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: namedAfterPage.searchResults});

            let namedAfterPageStub = {
                raw: {
                    fullurl: namedAfterPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(namedAfterPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(namedAfterPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve(namedAfterPage.page.imageUrl)),
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
                .onSecondCall().returns(namedAfterPageStub);

            const result = await streetWikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.equal(streetPage.page.content, result.description);
            assert.equal(streetPage.page.imageUrl, result.imageUrl);
            assert.isNull(result.namedAfterDescription);
            done();
        })();
    });

    it("should return street description with image taken from the street article, because person article has no image",
        (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const namedAfterTitle = streetWikiService.extractStreetName(testStreet.streetName);
            const namedAfterPage = getPage(namedAfterTitle);

            sinon.stub(wikiService, "search")
                .onFirstCall().returns({results: streetPage.searchResults})
                .onSecondCall().returns({results: namedAfterPage.searchResults});

            let namedAfterPageStub = {
                raw: {
                    fullurl: namedAfterPage.page.fullUrl
                },
                summary: sinon.stub().returns(Promise.resolve(namedAfterPage.page.content)),
                categories: sinon.stub().returns(Promise.resolve(namedAfterPage.page.categories)),
                mainImage: sinon.stub().returns(Promise.resolve("")),
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
                .onSecondCall().returns(namedAfterPageStub);

            const result = await streetWikiService.getStreetInfo(streetPage.searchKey);

            assert.exists(result);
            assert.equal(streetPage.page.content, result.description);
            assert.equal(streetPage.page.imageUrl, result.imageUrl);
            assert.equal(namedAfterPage.page.content, result.namedAfterDescription);
            done();
        })();
    });

    it("should return street named after person wiki page description", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets(true)[0];
            const title = streetWikiService.extractStreetName(testStreet.streetName);
            const testPage = stubWikiService(wikiService, title);

            const result = await streetWikiService.getNamedAfterWikiInfo(title);

            assert.exists(result);
            assert.equal(testPage.page.content, result.content);
            assert.equal(testPage.page.categories, result.categories);
            assert.equal(testPage.page.imageUrl, result.imageUrl);
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
            assert.equal(testPage.page.content, result.description);
            assert.isNull(result.namedAfterDescription);
            done();
        })();
    });

    it("should return the description of the street (named after)", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets(true)[0];
            const streetPage = getPage(getStreetSearchKey(testStreet));
            const title = streetWikiService.extractStreetName(testStreet.streetName);
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
            assert.equal(streetPage.page.content, result.description);
            assert.equal(personPage.page.content, result.namedAfterDescription);
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
            assert(result);
            assert.isNull(result.description);
            assert.isNull(result.namedAfterDescription);
            done();
        })();
    });

    it("should not return the content of the non existing page (getPageContent method)", (done) => {
        const wikiService = new WikiService();
        const streetWikiService = new StreetWikiService(wikiService);
        streetWikiService.getPageContent("Not Found").catch((error) => {
            assert(error);
            done();
        });
    });
});