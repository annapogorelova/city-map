"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../../data/dbTestData");
const testUtils = require("../../testUtils");
const db = require("../../../data/models/index");
const utils = require("../../../app/utils");
const {commonConstants, errors} = require("../../../app/constants/index");
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
            const createdStreet = await streetService.create({street: testStreet, ways: ways});

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
                await streetService.create({street: existingStreet.dataValues, ways: []});
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
            similarStreetModel.name = `${commonConstants.streetTypes[1]} ${cleanName}`;

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
                await streetService.create({street: testStreet, ways: ways});
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
            const testStreet = Object.assign({cityId: city.id}, street);
            let createdStreet = await db.street.create(testStreet);
            await createdStreet.addNamedEntity(oldNamedEntity);

            await streetService.update(createdStreet.id, {
                street: createdStreet.dataValues,
                namedEntities: [newNamedEntity]
            });

            const updatedStreet = await db.street.findById(createdStreet.id);
            const streetNamedEntities = await updatedStreet.getNamedEntities();

            assert.equal(streetNamedEntities.length, 1);
            assert.equal(streetNamedEntities[0].id, newNamedEntity.id);

            done();
        })();
    });

    it("should set new named entity for the street, that does not have the named entity", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const namedEntity = await db.namedEntity.create(testData.namedEntities[1]);

            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id}, street);
            let createdStreet = await db.street.create(testStreet);

            await streetService.update(createdStreet.id, {street: createdStreet, namedEntities: [namedEntity]});

            const updatedStreet = await db.street.findById(createdStreet.id);
            const streetNamedEntities = await updatedStreet.getNamedEntities();

            assert.equal(streetNamedEntities.length, 1);
            assert.equal(streetNamedEntities[0].id, namedEntity.id);

            done();
        })();
    });
    
    it("should not remove the named entity if there is at least one more street, depending on it", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const namedEntity = await db.namedEntity.create(testData.namedEntities[0]);
            const {ways, ...street} = testData.streets[0];

            const firstTestStreet = Object.assign({cityId: city.id}, street);
            let createdFirstStreet = await db.street.create(firstTestStreet);
            await createdFirstStreet.addNamedEntity(namedEntity);

            const secondTestStreet = Object.assign({cityId: city.id}, street);
            const createdSecondStreet = await db.street.create(secondTestStreet);
            await createdSecondStreet.addNamedEntity(namedEntity);

            await streetService.update(createdFirstStreet.id, {street: createdFirstStreet, namedEntities: []});

            const updatedStreet = await db.street.findById(createdFirstStreet.id);
            const streetNamedEntities = await updatedStreet.getNamedEntities();

            assert.equal(streetNamedEntities.length, 0);

            const createdNamedEntity = await db.namedEntity.findById(namedEntity.id);
            assert.exists(createdNamedEntity);

            done();
        })();
    });

    it("should add 2 new named entities to the street", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const namedEntities = await db.namedEntity.bulkCreate(testData.namedEntities.slice(0, 2));
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id}, street);
            let createdStreet = await db.street.create(testStreet);

            await streetService.update(createdStreet.id, {
                street: createdStreet.dataValues,
                namedEntities: namedEntities
            });

            const updatedStreet = await db.street.findById(createdStreet.id);
            const streetNamedEntities = await updatedStreet.getNamedEntities();

            assert.equal(streetNamedEntities.length, 2);
            assert.sameMembers(streetNamedEntities.map(e => e.id), namedEntities.map(e => e.id));

            done();
        })();
    });

    it("should not update named entities if they haven't changed", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const namedEntities = await db.namedEntity.bulkCreate(testData.namedEntities.slice(0, 2));
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id}, street);
            let createdStreet = await db.street.create(testStreet);

            await createdStreet.setNamedEntities(namedEntities);

            await streetService.update(createdStreet.id, {
                street: createdStreet.dataValues,
                namedEntities: namedEntities
            });

            const updatedStreet = await db.street.findById(createdStreet.id);
            const streetNamedEntities = await updatedStreet.getNamedEntities();

            assert.equal(streetNamedEntities.length, 2);
            assert.sameMembers(streetNamedEntities.map(e => e.id), namedEntities.map(e => e.id));

            done();
        })();
    });

    it("should throw error when trying to add non existing named entity", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id}, street);
            let createdStreet = await db.street.create(testStreet);

            const namedEntity = testData.namedEntities[0];

            try {
                await streetService.update(createdStreet.id, {
                    street: createdStreet.dataValues,
                    namedEntities: [namedEntity]
                });
            } catch (error) {
                assert.exists(error);
                assert.equal(error.message, errors.NOT_FOUND.key);
            }

            done();
        })();
    });

    it("should get the street by name", (done) => {
        (async () => {
            const city = await db.city.create(testCity);
            const {ways, ...street} = testData.streets[0];
            const testStreet = Object.assign({cityId: city.id}, street);
            let createdStreet = await db.street.create(testStreet);

            const streetByName = await streetService.getByName(createdStreet.name);
            assert.exists(streetByName);
            assert.equal(streetByName.id, createdStreet.id);

            done();
        })();
    });

    it("should get the street by name and cityId", (done) => {
        (async () => {
            const firstCity = await db.city.create(testCity);
            const secondCity = await db.city.create(testData.cities[1]);

            const {firstWays, ...firstTestStreet} = testData.streets[0];
            const firstStreet = await db.street.create(Object.assign({cityId: firstCity.id}, firstTestStreet));

            const {secondWays, ...secondTestStreet} = testData.streets[0];
            await db.street.create(Object.assign({cityId: secondCity.id}, secondTestStreet));

            const streetByName = await streetService.getByName(firstStreet.name, firstCity.id);
            assert.exists(streetByName);
            assert.equal(streetByName.id, firstStreet.id);
            assert.equal(streetByName.cityId, firstCity.id);

            done();
        })();
    });

    it("should search street by cityId", (done) => {
        (async () => {
            const firstCity = await db.city.create(testCity);
            const secondCity = await db.city.create(testData.cities[1]);

            const {firstWays, ...firstTestStreet} = testData.streets[0];
            const firstStreet = await db.street.create(Object.assign({cityId: firstCity.id}, firstTestStreet));

            const {secondWays, ...secondTestStreet} = testData.streets[0];
            await db.street.create(Object.assign({cityId: secondCity.id}, secondTestStreet));

            const {count, data} = await streetService.search({search: firstStreet.name, cityId: firstCity.id});
            assert.equal(count, 1);
            assert.include(data.map(s => s.id), firstStreet.id);

            done();
        })();
    });

    it("should search street just by name", (done) => {
        (async () => {
            const createdCity = await db.city.create(testCity);
            const createdStreets = await db.street.bulkCreate(testData.streets.map(street => {return {...street, cityId: createdCity.id}}));

            const {count, data} = await streetService.search({search: testData.streets[0].name, cityId: createdCity.id});
            assert.equal(count, 1);
            assert.include(data.map(s => s.id), createdStreets[0].id);

            done();
        })();
    });
});