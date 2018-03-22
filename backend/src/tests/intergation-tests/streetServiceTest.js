"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");
const streetService = require("../../data/services/streetService");
const db = require("../../data/models");

describe("street data service test", () => {
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
            const testStreet = Object.assign({}, testData.streets[0]);
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            testStreet.cityId = createdCity.id;
            const createdStreet = await db.street.create(testStreet);
            const streetById = await streetService.getById(createdStreet.id);
            assert.exists(streetById);
            assert.equal(streetById.id, createdStreet.id);
            assert.equal(streetById.name, createdStreet.name);
            assert.equal(streetById.description, createdStreet.description);
            done();
        })();
    });

    it("should throw when trying to create the existing street", (done) => {
        (async () => {
            const testStreet = Object.assign({}, testData.streets[0]);
            const testCity = testData.cities[0];
            const createdCity = await db.city.create(testCity);
            testStreet.cityId = createdCity.id;

            await db.street.create(testStreet);
            try {
                await streetService.create(testStreet);
            } catch(err) {
                assert.exists(err);
            } finally {
                done();
            }
        })();
    });
});