"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../../data/dbTestData");
const testUtils = require("../../testUtils");
const namedEntityService = testUtils.dc.get("NamedEntityService");

describe("named entity data service test", () => {
    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should create a named entity and return it when requested", (done) => {
        (async () => {
            const testNamedEntity = testData.namedEntities[0];
            const createdNamedEntity = await namedEntityService.create(testNamedEntity);
            assert.exists(createdNamedEntity);
            assert.equal(createdNamedEntity.name, testNamedEntity.name);
            assert.equal(createdNamedEntity.description, testNamedEntity.description);
            assert.equal(createdNamedEntity.wikiUrl, testNamedEntity.wikiUrl);
            assert.equal(createdNamedEntity.imageUrl, testNamedEntity.imageUrl);

            const existingPersonByName = await namedEntityService.getByName(createdNamedEntity.name);
            assert.exists(existingPersonByName);
            assert.equal(existingPersonByName.name, createdNamedEntity.name);
            assert.equal(existingPersonByName.description, createdNamedEntity.description);
            assert.equal(existingPersonByName.wikiUrl, createdNamedEntity.wikiUrl);
            assert.equal(existingPersonByName.imageUrl, createdNamedEntity.imageUrl);

            const existingPersonById = await namedEntityService.getById(createdNamedEntity.id);
            assert.exists(existingPersonById);
            assert.equal(existingPersonById.name, createdNamedEntity.name);
            assert.equal(existingPersonById.description, createdNamedEntity.description);
            assert.equal(existingPersonById.wikiUrl, createdNamedEntity.wikiUrl);
            assert.equal(existingPersonById.imageUrl, createdNamedEntity.imageUrl);

            done();
        })();
    });

    it("should throw an Error when trying to create the existing person", (done) => {
        (async () => {
            const testNamedEntity = testData.namedEntities[0];
            const createdNamedEntity = await namedEntityService.create(testNamedEntity);
            assert.exists(createdNamedEntity);

            try {
                await namedEntityService.create(testNamedEntity);
            } catch (error) {
                assert.exists(error);
            } finally {
                done();
            }
        })();
    });
});