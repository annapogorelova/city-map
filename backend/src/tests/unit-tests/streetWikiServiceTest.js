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
        content: sinon.stub().returns(testPage.page.content),
        categories: sinon.stub().returns(testPage.page.categories),
        mainImage: sinon.stub().returns(testPage.page.imageUrl)
    };
    sinon.stub(wikiService, 'getPage').returns(pageStub);
    return testPage;
}

describe("wiki service test", () => {
    it("should return street wiki page description", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets()[0];
            const testPage = stubWikiService(wikiService, getStreetSearchKey(testStreet));
            const result = await streetWikiService.getStreetWikiDescription(testStreet.streetName, testStreet.cityName);

            assert.exists(result);
            assert.equal(testPage.page.content, result);

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

            const result = await streetWikiService.getStreetNamedAfterWikiDescription(title);

            assert.exists(result);
            assert.equal(testPage.page.content, result);

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
                .onFirstCall().returns({results: []})
                .onSecondCall().returns({results: testPage.searchResults});
            let pageStub = {
                raw: {
                    title: testPage.page.title
                },
                content: sinon.stub().returns(testPage.page.content),
                categories: sinon.stub().returns(testPage.page.categories),
                mainImage: sinon.stub().returns(testPage.page.imageUrl),
            };
            sinon.stub(wikiService, 'getPage').returns(pageStub);

            const result = await streetWikiService.getStreetDescription(testPage.searchKey);

            assert.exists(result);
            assert.equal(testPage.page.content, result);

            done();
        })();
    });

    it("should return the description of the person named after", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);

            const testStreet = getStreets(true)[0];
            const testPage = getPage(getStreetSearchKey(testStreet));
            const title = streetWikiService.extractStreetName(testStreet.streetName);
            const personPage = getPage(title);

            sinon.stub(wikiService, 'search')
                .onFirstCall().returns({results: personPage.searchResults})
                .onSecondCall().returns({results: testPage.searchResults});

            let personPageStub = {
                content: sinon.stub().returns(personPage.page.content),
                categories: sinon.stub().returns(personPage.page.categories),
                mainImage: sinon.stub().returns(testPage.page.imageUrl),
            };

            let streetPageStub = {
                content: sinon.stub().returns(testPage.page.content),
                categories: sinon.stub().returns(testPage.page.categories),
                mainImage: sinon.stub().returns(testPage.page.imageUrl),
            };

            sinon.stub(wikiService, 'getPage')
                .onFirstCall().returns(personPageStub)
                .onSecondCall().returns(streetPageStub);

            const result = await streetWikiService.getStreetDescription(testPage.searchKey);

            assert.exists(result);
            assert.equal(personPage.page.content, result);

            done();
        })();
    });

    it("should not return the content of non existing article", (done) => {
        (async () => {
            const wikiService = new WikiService();
            const streetWikiService = new StreetWikiService(wikiService);
            const testStreet = getStreets(true)[0];
            sinon.stub(wikiService, 'search').returns({results: []});

            const result = await streetWikiService.getStreetDescription(testStreet.streetName, testStreet.cityName);
            assert.isNull(result);
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