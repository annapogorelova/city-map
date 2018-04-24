"use strict";

const JsonGeoDataProvider = require("../../lib/geo/jsonGeoDataProvider");
const WikiService = require("../../lib/wiki/wikiService");
const db = require("../../data/models/index");
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");

const chai = require("chai");
const assert = chai.assert;
const sinon = require("sinon");

describe("geoDataService test", () => {
    const jsonGeoParser = testUtils.dc.get("GeoParser");
    const streetService = testUtils.dc.get("StreetService");
    const namedEntityService = testUtils.dc.get("NamedEntityService");

    before((done) => {
        // Replacing the data directory path
        testUtils.dc.registerBinding("GeoDataProvider", JsonGeoDataProvider, {
            dependencies: [
                () => "../../tests/data",
                "GeoDataFormatter"
            ]
        });

        testUtils.cleanDB().then(() => {
            done();
        });
    });

    afterEach(function(done) {
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

    it("should reject Promise when city exists but json file does not exist", (done) => {
        (async () => {
            const testCity = Object.assign({}, testData.cities[0]);
            testCity.name = "Atlantida";
            const createdCity = await db.city.create(testCity);
            jsonGeoParser.parse(createdCity.name).catch(err => {
                assert(err);
                done();
            });
        })();
    });

    it("should correctly parse the json file with geo data and add streets to db", (done) => {
        (async () => {
            const testDescription = "Street description";
            const testWikiUrl = "https://uk.wikipedia.org/articte";

            const testPersonName = "Person name";
            const testPersonDescription = "Person description";
            const testPersonWikiUrl = "https://uk.wikipedia.org/person";

            const city = await db.city.create(testData.cities[1]); // Zhovkva
            const loadedStreets = await jsonGeoParser.parse(city.nameEn);
            const wikiService =  new WikiService(testUtils.dc.get("WikiApiService"));

            const getStreetInfoStub = sinon.stub(wikiService, "getStreetInfo");
            const getNamedEntityInfoStub = sinon.stub(wikiService, "getNamedEntityInfo");

            for(let i = 0; i < loadedStreets.length; i++) {
                getStreetInfoStub.onCall(i).resolves({
                    description: testDescription,
                    wikiUrl: testWikiUrl
                });

                if(i % 2) {
                    getNamedEntityInfoStub.onCall(i).resolves({
                        name: testPersonName,
                        description: testPersonDescription,
                        wikiUrl: testPersonWikiUrl,
                        tags: []
                    });
                } else {
                    getNamedEntityInfoStub.onCall(i).resolves(null);
                }
            }

            testUtils.dc.registerInstance("WikiService", wikiService);

            const geoDataService = testUtils.dc.get("GeoDataService");
            await geoDataService.processCity(city);
            const addedStreets = await streetService.getByCity(city.id);

            for(let i = 0; i < addedStreets.length; i++) {
                assert.equal(loadedStreets[i].name, addedStreets[i].name);
                assert.equal(addedStreets[i].description, testDescription);
                assert.equal(addedStreets[i].wikiUrl, testWikiUrl);
                assert.exists(addedStreets[i].ways);

                if(i % 2) {
                    assert.equal(addedStreets[i].namedEntity.name, testPersonName);
                    assert.equal(addedStreets[i].namedEntity.wikiUrl, testPersonWikiUrl);
                    assert.equal(addedStreets[i].namedEntity.description, testPersonDescription);
                } else {
                    assert.isNull(addedStreets[i].namedEntity);
                }
            }
            done();
        })();
    }).timeout(10000);

    it("should throw error when createStreet method fails", (done) => {
        (async () => {
            const city = await db.city.create(testData.cities[1]);
            const errorMessage = "Failed!";
            sinon.stub(jsonGeoParser, "parse").throws(errorMessage);
            testUtils.dc.registerInstance("GeoParser", jsonGeoParser);
            const geoDataService = testUtils.dc.get("GeoDataService");

            try {
                await geoDataService.processCity(city);
            } catch (error) {
                assert.exists(error);
                assert.equal(errorMessage, error.message);
                done();
            }
        })();
    });

    it("should not create the existing street", (done) => {
        (async () => {
            const city = await db.city.create(testData.cities[1]);
            const testStreet = Object.assign({}, testData.streets[0]);
            testStreet.cityId = city.id;
            await db.street.create(testStreet);
            const geoDataService = testUtils.dc.get("GeoDataService");

            try {
                await geoDataService.createStreet({name: testStreet.name});
            } catch (error) {
                assert.exists(error);
                done();
            }
        })();
    });

    it("should add the streets with the same names but different cities", (done) => {
        (async () => {
            const cities = await db.city.bulkCreate(testData.cities.slice(0, 2));
            const testStreet = Object.assign({}, testData.streets[0]);

            const testDescription = "Street description";
            const testWikiUrl = "https://uk.wikipedia.org/articte";

            const streetInfo = {
                description: testDescription,
                wikiUrl: testWikiUrl
            };

            const wikiService =  new WikiService(testUtils.dc.get("WikiApiService"));
            sinon.stub(wikiService, "getStreetInfo").resolves(streetInfo);
            sinon.stub(wikiService, "getNamedEntityInfo").resolves(null);
            testUtils.dc.registerInstance("WikiService", wikiService);
            const geoDataService = testUtils.dc.get("GeoDataService");

            // create the street for the first city
            const firstCityStreet = await geoDataService.processStreet(testStreet, cities[0]);
            assert(firstCityStreet);
            assert.equal(cities[0].id, firstCityStreet.cityId);
            assert.equal(testStreet.name, firstCityStreet.name);

            // create the street for the second city
            const secondCityStreet = await geoDataService.processStreet(testStreet, cities[1]);
            assert(secondCityStreet);
            assert.equal(cities[1].id, secondCityStreet.cityId);
            assert.equal(testStreet.name, secondCityStreet.name);

            done();
        })();
    });

    it("should not search for the named entity and create it if " +
        "the street with the same name already exists", (done) => {
        (async () => {
            const cities = await db.city.bulkCreate(testData.cities.slice(0, 2));
            const testStreet = Object.assign({}, testData.streets[0]);

            const streetInfo = {
                description: "Street description",
                wikiUrl: "https://uk.wikipedia.org/articte"
            };

            const namedEntityInfo = {
                name: "Тарас Шевченко",
                description: "український поет",
                wikiUrl: "https://uk.wikipedia.org/shevchenko",
                tags: []
            };

            const wikiService =  new WikiService(testUtils.dc.get("WikiApiService"));

            sinon.stub(wikiService, "getStreetInfo").resolves(streetInfo);
            sinon.stub(wikiService, "getNamedEntityInfo").resolves(namedEntityInfo);

            testUtils.dc.registerInstance("WikiService", wikiService);
            const geoDataService = testUtils.dc.get("GeoDataService");

            // create the street for the first city
            const firstCityStreet = await geoDataService.processStreet(testStreet, cities[0]);
            assert(firstCityStreet);
            assert.equal(cities[0].id, firstCityStreet.cityId);
            assert.equal(testStreet.name, firstCityStreet.name);
            assert.exists(firstCityStreet.namedEntityId);

            // create the street for the second city
            const secondCityStreet = await geoDataService.processStreet(testStreet, cities[1]);
            assert(secondCityStreet);
            assert.equal(cities[1].id, secondCityStreet.cityId);
            assert.equal(testStreet.name, secondCityStreet.name);
            assert.exists(secondCityStreet.namedEntityId);

            assert.equal(firstCityStreet.namedEntityId, secondCityStreet.namedEntityId);

            const namedEntity = await namedEntityService.getById(firstCityStreet.namedEntityId);

            assert.equal(namedEntityInfo.name, namedEntity.name);
            assert.equal(namedEntityInfo.description, namedEntity.description);
            assert.equal(namedEntityInfo.wikiUrl, namedEntity.wikiUrl);

            done();
        })();
    });
});