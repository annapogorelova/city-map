"use strict";

const OverpassGeoDataFormatter = require("../../lib/geo/overpassGeoDataFormatter");
const JsonGeoDataProvider = require("../../lib/geo/jsonGeoDataProvider");
const GeoParser = require("../../lib/geo/geoParser");
const geoDataFormatter = new OverpassGeoDataFormatter();
const jsonGeoParser = new GeoParser(
    new JsonGeoDataProvider("./data", geoDataFormatter),
    geoDataFormatter);
const GeoDataService = require("../../lib/geo/geoDataService");
const geoDataService = new GeoDataService(jsonGeoParser);
const db = require("../../data/models/index");
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");

const chai = require("chai");
const assert = chai.assert;

describe("geoDataService test", () => {
    afterEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should correctly parse the json file with geo data and add streets to db", (done) => {
        (async () => {
            const city = await db.city.create(testData.cities[0]);
            const loadedStreets = await jsonGeoParser.parse(city.nameEn);
            const addedStreets = await geoDataService.processCity(city);

            assert.equal(loadedStreets.length, addedStreets.length);

            for(let i = 0; i < addedStreets.length; i++) {
                assert.equal(loadedStreets[i].name, addedStreets[i].name);
            }
            done();
        })();
    }).timeout(20000);
});