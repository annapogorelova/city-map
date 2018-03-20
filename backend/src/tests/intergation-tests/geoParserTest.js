"use strict";

const OverpassGeoDataFormatter = require("../../lib/geo/overpassGeoDataFormatter");
const JsonGeoDataProvider = require("../../lib/geo/jsonGeoDataProvider");
const GeoParser = require("../../lib/geo/geoParser");
const geoDataFormatter = new OverpassGeoDataFormatter();
const jsonGeoParser = new GeoParser(
    new JsonGeoDataProvider("../../tests/data", geoDataFormatter),
    geoDataFormatter);
const GeoDataService = require("../../lib/geo/geoDataService");
const StreetWikiService = require("../../lib/wiki/streetWikiService");
const WikiService = require("../../lib/wiki/wikiService");
const db = require("../../data/models/index");
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");
const streetService = require("../../data/services/streetService");

const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");

describe("geoDataService test", () => {
    before((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    afterEach(function (done) {
        this.timeout(10000);
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should reject Promise when json file does not exist", (done) => {
        jsonGeoParser.parse("NonExisting").catch(err => {
            assert(err);
            done();
        });
    });

    it("should correctly parse the json file with geo data and add streets to db", (done) => {
        (async () => {
            const testDescription = "Street description";
            const testNamedAfterDescription = "Named after description";
            const testImageUrl = "https://uk.wikipedia.org/image.jpg";
            const testWikiUrl = "https://uk.wikipedia.org/articte";
            const testWikiNamedAfterWikiUrl = "https://uk.wikipedia.org/named_after";

            const streetWikiService = new StreetWikiService(new WikiService());

            sinon.stub(streetWikiService, "getStreetInfo").returns(Promise.resolve({
                description: testDescription,
                namedAfterDescription: testNamedAfterDescription,
                imageUrl: testImageUrl,
                wikiUrl: testWikiUrl,
                namedAfterWikiUrl: testWikiNamedAfterWikiUrl
            }));
            const geoDataService = new GeoDataService(jsonGeoParser, streetWikiService);

            const city = await db.city.create(testData.cities[1]); // Zhovkva
            const loadedStreets = await jsonGeoParser.parse(city.nameEn);
            await geoDataService.processCity(city);
            const addedStreets = await streetService.getByCity(city.id);

            for(let i = 0; i < addedStreets.length; i++) {
                assert.equal(loadedStreets[i].name, addedStreets[i].name);
                assert.equal(addedStreets[i].description, testDescription);
                assert.equal(addedStreets[i].namedAfterDescription, testNamedAfterDescription);
                assert.equal(addedStreets[i].imageUrl, testImageUrl);
                assert.equal(addedStreets[i].wikiUrl, testWikiUrl);
                assert.equal(addedStreets[i].namedAfterWikiUrl, testWikiNamedAfterWikiUrl);
                assert.exists(addedStreets[i].coords);
            }
            done();
        })();
    }).timeout(90000);
});