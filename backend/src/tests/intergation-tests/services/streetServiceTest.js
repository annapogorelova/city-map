"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../../data/dbTestData");
const testUtils = require("../../testUtils");
const db = require("../../../data/models/index");
const utils = require("../../../app/utils");
const {common, errors} = require("../../../app/constants/index");
const {optional} = require("tooleks");

describe("street data service test", () => {
    const testCity = testData.cities[0];
    const streetService = testUtils.dc.get("StreetService");

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
            const existingStreet = await testUtils.createStreet(testData.streets[0], createdCity.id);

            try {
                await streetService.create(existingStreet.dataValues, []);
            } catch (error) {
                assert.exists(error);
                assert.equal(error.message, errors.ALREADY_EXISTS.key);

                done();
            }
        })();
    });

    it("should return different street types with the similar name", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const firstStreet = await testUtils.createStreet(testData.streets[0], createdCity.id);
            const otherStreet = await testUtils.createStreet(testData.streets[1], createdCity.id);

            let similarStreetModel = Object.assign({}, testData.streets[0]);
            const cleanName = utils.extractStreetName(similarStreetModel.name);
            similarStreetModel.name = `${common.streetTypes[1]} ${cleanName}`;

            const secondStreet = await testUtils.createStreet(similarStreetModel, createdCity.id);

            const similarStreets = await streetService.getBySimilarName(secondStreet.name);
            assert.exists(similarStreets);
            assert.equal(2, similarStreets.length);

            let fistStreetFound = optional(() => similarStreets.filter(s => s.id === firstStreet.id)[0]);
            assert.exists(fistStreetFound);

            let secondStreetFound = optional(() => similarStreets.filter(s => s.id === secondStreet.id)[0]);
            assert.exists(secondStreetFound);

            let otherStreetFound = optional(() => similarStreets.filter(s => s.id === otherStreet.id)[0]);
            assert.notExists(otherStreetFound);

            done();
        })();
    });

    it("should strictly compare the streets by name", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            let createdStreets = [];

            const testCases = [
                {name: "вулиця Тараса Шевченка", valid: true},
                {name: "проспект Тараса Шевченка", valid: true},
                {name: "проспект Шевченка", valid: false},
                {name: "провулок Тараса Шевча", valid: false},
                {name: "проспект Олександра Шевченка", valid: false},
                // injections test
                {name: "') or 1 = 1;", valid: false},
                {name: "'); drop table street;", valid: false},
            ];

            for(let testCase of testCases) {
                let street = Object.assign({}, testData.streets[0], {name: testCase.name});
                createdStreets.push(await testUtils.createStreet(street, createdCity.id))
            }

            const similarStreets = await streetService.getBySimilarName(testCases[0].name);
            assert.exists(similarStreets);
            assert.equal(testCases.filter(tc => tc.valid).length, similarStreets.length);

            for(let i = 0; i < testCases.length; i++) {
                let streetFound = optional(() => similarStreets.filter(s => s.id === createdStreets[i].id)[0]);
                if(testCases[i].valid) {
                    assert.exists(streetFound);
                } else {
                    assert.notExists(streetFound);
                }
            }

            done();
        })();
    });

    it("should not create an existing street", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: createdCity.id}, street);
            await db.street.create(testStreet);

            try {
                await streetService.create(testStreet, ways);
            } catch (error) {
                assert.exists(error);
                assert.equal(error.message, errors.ALREADY_EXISTS.key);

                done();
            }
        })();
    });

    it("should update the existing street", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: createdCity.id}, street);
            let createdStreet = await db.street.create(testStreet).then(entity => entity.get({ plain: true }));

            const newName = "Crazy street";
            createdStreet.name = newName;

            await streetService.update(createdStreet.id, createdStreet);
            const updatedStreet = await streetService.getById(createdStreet.id);
            assert.equal(updatedStreet.name, newName);

            done();
        })();
    });

    it("should throw error when trying to update the non existing street", (done) => {
        (async () => {
            try {
                await streetService.update(1, testData.streets[0]);
            } catch (error) {
                assert.exists(error);
                assert.equal(error.message, errors.NOT_FOUND.key);

                done();
            }
        })();
    });

    it("should set new named entity for the street, that already has a named entity", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const oldNamedEntity = await db.namedEntity.create(testData.namedEntities[0]);
            const newNamedEntity = await db.namedEntity.create(testData.namedEntities[1]);

            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id, namedEntityId: oldNamedEntity.id}, street);
            let createdStreet = await db.street.create(testStreet).then(entity => optional(() => entity.get({plain: true})));
            createdStreet.namedEntityId = newNamedEntity.id;

            await streetService.update(createdStreet.id, createdStreet);

            const updatedStreet = await db.street.findById(createdStreet.id);
            assert.equal(newNamedEntity.id, updatedStreet.namedEntityId);

            done();
        })();
    });

    it("should set new named entity for the street, that does not have the named entity", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const oldNamedEntity = await db.namedEntity.create(testData.namedEntities[0]);
            const newNamedEntity = await db.namedEntity.create(testData.namedEntities[1]);

            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id, namedEntityId: oldNamedEntity.id}, street);
            let createdStreet = await db.street.create(testStreet).then(entity => optional(() => entity.get({plain: true})));
            createdStreet.namedEntityId = newNamedEntity.id;

            await streetService.update(createdStreet.id, createdStreet);

            const updatedStreet = await db.street.findById(createdStreet.id);
            assert.equal(newNamedEntity.id, updatedStreet.namedEntityId);

            done();
        })();
    });

    it("should remove the named entity completely if there are no more streets, depending on it", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const namedEntity = await db.namedEntity.create(testData.namedEntities[0]);
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id, namedEntityId: namedEntity.id}, street);
            let createdStreet = await db.street.create(testStreet).then(entity => optional(() => entity.get({plain: true})));
            createdStreet.namedEntityId = undefined;

            await streetService.update(createdStreet.id, createdStreet);

            const updatedStreet = await db.street.findById(createdStreet.id);
            assert.isNull(updatedStreet.namedEntityId);

            const createdNamedEntity = await db.namedEntity.findById(namedEntity.id);
            assert.notExists(createdNamedEntity);

            done();
        })();
    });

    it("should not remove the named entity if there is at least one more street, depending on it", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const namedEntity = await db.namedEntity.create(testData.namedEntities[0]);
            const {ways, ...street} = testData.streets[0];
            const firstTestStreet = Object.assign({cityId: city.id, namedEntityId: namedEntity.id}, street);
            let createdStreet = await db.street.create(firstTestStreet).then(entity => optional(() => entity.get({plain: true})));

            const secondTestStreet = Object.assign({cityId: city.id, namedEntityId: namedEntity.id}, street);
            await db.street.create(secondTestStreet);

            createdStreet.namedEntityId = null;

            await streetService.update(createdStreet.id, createdStreet);

            const updatedStreet = await db.street.findById(createdStreet.id);
            assert.isNull(updatedStreet.namedEntityId);

            const createdNamedEntity = await db.namedEntity.findById(namedEntity.id);
            assert.exists(createdNamedEntity);

            done();
        })();
    });
});