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

    it("should throw error when trying to update the non existing named entity", (done) => {
        (async () => {
            const namedEntity = testData.namedEntities[0];

            try {
                await namedEntityService.update(namedEntity);
            } catch (error) {
                done();
            }
        })();
    });

    it("should update the named entity, add new tags", (done) => {
        (async () => {
            const namedEntity = testData.namedEntities[0];
            let createdNamedEntity = await db.namedEntity.create(namedEntity).then(e => e.get({plain: true}));
            const newName = "Король Данило";
            createdNamedEntity.name = newName;

            await namedEntityService.update(createdNamedEntity);
            const updatedNamedEntity = await db.namedEntity.findOne({
                where: {id: createdNamedEntity.id}
            });

            assert.equal(updatedNamedEntity.name, newName);

            done();
        })();
    });

    it("should update the named entity, add new tags", (done) => {
        (async () => {
            const namedEntity = Object.assign(testData.namedEntities[0], {});
            const tags = [{name: "князі"}, {name: "рюриковичі"}, {name: "королі"}];
            let createdNamedEntity = await db.namedEntity.create(namedEntity);
            const createdTags = await db.tag.bulkCreate(tags);
            await createdNamedEntity.setTags(createdTags.slice(0, 2));

            const newName = "Король Данило";
            createdNamedEntity.dataValues.name = newName;
            const newTags = ["князі", "королі", "воїни"];

            await namedEntityService.update(createdNamedEntity.dataValues, newTags);
            const updatedNamedEntity = await db.namedEntity.findOne({
                where: {id: createdNamedEntity.id},
                include: [{model: db.tag}]
            });

            assert.equal(updatedNamedEntity.name, newName);
            assert.exists(updatedNamedEntity.tags);
            assert.includeMembers(updatedNamedEntity.tags.map(tag => tag.name), newTags);
            assert.includeMembers(updatedNamedEntity.tags.map(tag => tag.name), tags.map(tag => tag.name));

            done();
        })();
    });

    it("should get all named entities", (done) => {
        (async () => {
            await db.namedEntity.bulkCreate(testData.namedEntities);
            const namedEntities = await namedEntityService.getAll();

            assert.sameMembers(
                testData.namedEntities.map(namedEntity => namedEntity.name),
                namedEntities.map(namedEntity => namedEntity.name));

            done();
        })();
    });
});