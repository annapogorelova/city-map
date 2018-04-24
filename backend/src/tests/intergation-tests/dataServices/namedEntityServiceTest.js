"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../../data/dbTestData");
const testUtils = require("../../testUtils");
const db = require("../../../data/models/index");

describe("named entity data service test", () => {
    const namedEntityService = testUtils.dc.get("NamedEntityService");

    beforeEach((done) => {
        testUtils.cleanDB().then(() => {
            done();
        });
    });

    it("should create the named entity without tags", (done) => {
        (async () => {
            const namedEntity = testData.namedEntities[0];
            const createdNamedEntity = await namedEntityService.create(namedEntity);

            assert.exists(createdNamedEntity);
            assert.equal(createdNamedEntity.name, namedEntity.name);
            assert.equal(createdNamedEntity.description, namedEntity.description);

            done();
        })();
    });

    it("should create the named entity with the given tags", (done) => {
        (async () => {
            const {tags, ...namedEntityWithTags} = testData.namedEntities.filter(n => n.tags.length > 0)[0];
            await namedEntityService.create(namedEntityWithTags, tags);
            const createdNamedEntity = await namedEntityService.getByName(namedEntityWithTags.name);

            assert.exists(createdNamedEntity);
            assert.equal(createdNamedEntity.name, namedEntityWithTags.name);
            assert.equal(createdNamedEntity.description, namedEntityWithTags.description);
            assert.equal(createdNamedEntity.imageUrl, namedEntityWithTags.imageUrl);
            assert.equal(createdNamedEntity.wikiUrl, namedEntityWithTags.wikiUrl);
            assert.exists(createdNamedEntity.tags);
            assert.sameMembers(tags, createdNamedEntity.tags.map(tag => tag.name));

            done();
        })();
    });

    it("should bind the created named entity to the existing tags", (done) => {
        (async () => {
            const {tags, ...namedEntityWithTags} = testData.namedEntities.filter(n => n.tags.length > 0)[0];
            const createdTags = await db.tag.bulkCreate(tags.map(tag => {
                return {name: tag}
            }));

            await namedEntityService.create(namedEntityWithTags, tags);
            const createdNamedEntity = await namedEntityService.getByName(namedEntityWithTags.name);

            assert.exists(createdNamedEntity);
            assert.equal(createdNamedEntity.name, namedEntityWithTags.name);
            assert.equal(createdNamedEntity.description, namedEntityWithTags.description);
            assert.equal(createdNamedEntity.imageUrl, namedEntityWithTags.imageUrl);
            assert.equal(createdNamedEntity.wikiUrl, namedEntityWithTags.wikiUrl);
            assert.exists(createdNamedEntity.tags);
            assert.sameMembers(createdTags.map(tag => tag.id), createdNamedEntity.tags.map(tag => tag.id));
            assert.sameMembers(createdTags.map(tag => tag.name), createdNamedEntity.tags.map(tag => tag.name));

            done();
        })();
    });

    it("should not create the existing named entity", (done) => {
        (async () => {
            const namedEntity = testData.namedEntities[0];
            await db.namedEntity.create(namedEntity);

            try {
                await namedEntityService.create(namedEntity);
            } catch (error) {
                assert.exists(error);
            }

            done();
        })();
    });
});