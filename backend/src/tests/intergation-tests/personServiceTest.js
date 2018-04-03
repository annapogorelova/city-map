"use strict";
const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/dbTestData");
const testUtils = require("../testUtils");
const personService = testUtils.dc.get("PersonService");

describe("person data service test", () => {
    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should create a person and return it when requested", (done) => {
        (async () => {
            const testPerson = testData.people[0];
            const createdPerson = await personService.create(testPerson);
            assert.exists(createdPerson);
            assert.equal(createdPerson.name, testPerson.name);
            assert.equal(createdPerson.description, testPerson.description);
            assert.equal(createdPerson.wikiUrl, testPerson.wikiUrl);
            assert.equal(createdPerson.imageUrl, testPerson.imageUrl);

            const existingPersonByName = await personService.getByName(createdPerson.name);
            assert.exists(existingPersonByName);
            assert.equal(existingPersonByName.name, createdPerson.name);
            assert.equal(existingPersonByName.description, createdPerson.description);
            assert.equal(existingPersonByName.wikiUrl, createdPerson.wikiUrl);
            assert.equal(existingPersonByName.imageUrl, createdPerson.imageUrl);

            const existingPersonById = await personService.getById(createdPerson.id);
            assert.exists(existingPersonById);
            assert.equal(existingPersonById.name, createdPerson.name);
            assert.equal(existingPersonById.description, createdPerson.description);
            assert.equal(existingPersonById.wikiUrl, createdPerson.wikiUrl);
            assert.equal(existingPersonById.imageUrl, createdPerson.imageUrl);

            done();
        })();
    });

    it("should throw an Error when trying to create the existing person", (done) => {
        (async () => {
            const testPerson = testData.people[0];
            const createdPerson = await personService.create(testPerson);
            assert.exists(createdPerson);

            try {
                const createdPersonDuplicate = await personService.create(testPerson);
            } catch(err) {
                assert.exists(err);
            } finally {
                done();
            }
        })();
    });
});