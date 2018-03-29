"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");
const streetService = require("../../data/services/streetService");
const db = require("../../data/models");

describe("street data service test", () => {
    const testCity = testData.cities[0];

    before((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    afterEach((done) => {
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
            } finally {
                done();
            }
        })();
    });
});