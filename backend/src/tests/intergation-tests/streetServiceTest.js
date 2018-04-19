"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");
const streetService = testUtils.dc.get("StreetService");
const db = require("../../data/models");
const utils = require("../../app/utils");
const constants = require("../../app/constants");
const {optional} = require("tooleks");

describe("street data service test", () => {
    const testCity = testData.cities[0];

    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should return street by id", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const createdStreet = await testUtils.createStreet(testData.streets[0], createdCity.id);
            const streetById = await streetService.getById(createdStreet.id);
            assert.exists(streetById);
            assert.equal(streetById.id, createdStreet.id);
            assert.equal(streetById.name, createdStreet.name);
            assert.equal(streetById.description, createdStreet.description);
            done();
        })();
    });

    it("should create a street with given ways", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: createdCity.id}, street);
            const createdStreet = await streetService.create(testStreet, ways);
            assert(createdStreet);
            assert.equal(createdStreet.name, testStreet.name);
            assert.equal(createdStreet.description, testStreet.description);
            assert.equal(createdStreet.cityId, testStreet.cityId);
            const streetWays = await createdStreet.getWays();
            ways.map((w, i) => {
                assert.deepEqual(w, streetWays[i].coordinates);
            });
            done();
        })();
    });

    it("should throw when trying to create the existing street", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const existingStreet = testUtils.createStreet(testData.streets[0], createdCity.id);
            try {
                await streetService.create(existingStreet, []);
            } catch(err) {
                assert.exists(err);
                done();
            }
        })();
    });

    it("should return different street types with the similar name", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const firstStreet = await testUtils.createStreet(testData.streets[0], createdCity.id);

            let similarStreetModel = Object.assign({}, testData.streets[0]);
            const cleanName = utils.extractStreetName(similarStreetModel.name);
            similarStreetModel.name = `${constants.streetTypes[1]} ${cleanName}`;

            const secondStreet = await testUtils.createStreet(similarStreetModel, createdCity.id);

            const similarStreets = await streetService.getBySimilarName(secondStreet.name);
            assert.exists(similarStreets);
            assert.equal(2, similarStreets.length);

            let fistStreetFound = optional(() => similarStreets.filter(s => s.id === firstStreet.id)[0]);
            assert.exists(fistStreetFound);

            let secondStreetFound = optional(() => similarStreets.filter(s => s.id === firstStreet.id)[0]);
            assert.exists(secondStreetFound);

            const similarStreetsFiltered = await streetService.getBySimilarName(secondStreet.name, secondStreet.id);
            assert.exists(similarStreetsFiltered);
            assert.equal(1, similarStreetsFiltered.length);
            assert.equal(firstStreet.id, similarStreetsFiltered[0].id);

            done();
        })();
    });
});