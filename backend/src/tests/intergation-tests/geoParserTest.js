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
            const testPersonName = "Person Person";
            const testDescription = "Street description";
            const testPersonDescription = "Named after description";
            const testImageUrl = "https://uk.wikipedia.org/image.jpg";
            const testWikiUrl = "https://uk.wikipedia.org/articte";
            const testWikiPersonWikiUrl = "https://uk.wikipedia.org/named_after";

            const city = await db.city.create(testData.cities[1]); // Zhovkva
            const loadedStreets = await jsonGeoParser.parse(city.nameEn);
            const wikiService =  new WikiService(testUtils.dc.get("WikiApiService"));

            const stub = sinon.stub(wikiService, "getStreetInfo");
            for(let i = 0; i < loadedStreets.length; i++) {
                let returnValue = {
                    street: {
                        description: testDescription,
                        wikiUrl: testWikiUrl
                    }
                };
                if(i % 2 === 0) {
                    returnValue["namedEntity"] = {
                        name: testPersonName,
                        description: testPersonDescription,
                        wikiUrl: testWikiPersonWikiUrl,
                        imageUrl: testImageUrl
                    };
                }

                stub.onCall(i).returns(Promise.resolve(returnValue));
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

                if(i % 2 === 0) {
                    assert.equal(addedStreets[i].namedEntity.name, testPersonName);
                    assert.equal(addedStreets[i].namedEntity.wikiUrl, testWikiPersonWikiUrl);
                    assert.equal(addedStreets[i].namedEntity.description, testPersonDescription);
                    assert.equal(addedStreets[i].namedEntity.imageUrl, testImageUrl);
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
            } catch(err) {
                assert.exists(err);
                assert.equal(errorMessage, err.message);
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
            } catch(err) {
                assert.exists(err);
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

            let returnValue = {
                street: {
                    description: testDescription,
                    wikiUrl: testWikiUrl
                }
            };

            const wikiService =  new WikiService(testUtils.dc.get("WikiApiService"));
            sinon.stub(wikiService, "getStreetInfo").returns(returnValue);
            testUtils.dc.registerInstance("WikiService", wikiService);
            const geoDataService = testUtils.dc.get("GeoDataService");

            // create the street for the first city
            const firstCityStreet = await geoDataService.createStreet(testStreet, cities[0]);
            assert(firstCityStreet);
            assert.equal(cities[0].id, firstCityStreet.cityId);
            assert.equal(testStreet.name, firstCityStreet.name);

            // create the street for the second city
            const secondCityStreet = await geoDataService.createStreet(testStreet, cities[1]);
            assert(secondCityStreet);
            assert.equal(cities[1].id, secondCityStreet.cityId);
            assert.equal(testStreet.name, secondCityStreet.name);

            done();
        })();
    });
});