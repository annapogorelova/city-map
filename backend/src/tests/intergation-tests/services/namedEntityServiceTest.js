"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../../data/dbTestData");
const testUtils = require("../../testUtils");
const db = require("../../../data/models/index");
const {errors} = require("../../../app/constants/index");

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
            const namedEntity = testData.namedEntities.filter(n => n.tags.length > 0)[0];
            await namedEntityService.create(namedEntity);
            const createdNamedEntity = await namedEntityService.getByName(namedEntity.name);

            assert.exists(createdNamedEntity);
            assert.equal(createdNamedEntity.name, namedEntity.name);
            assert.equal(createdNamedEntity.description, namedEntity.description);
            assert.equal(createdNamedEntity.imageUrl, namedEntity.imageUrl);
            assert.equal(createdNamedEntity.wikiUrl, namedEntity.wikiUrl);
            assert.exists(createdNamedEntity.tags);
            assert.sameMembers(namedEntity.tags.map(t => t.name), createdNamedEntity.tags.map(tag => tag.name));

            done();
        })();
    });

    it("should bind the created named entity to the existing tags", (done) => {
        (async () => {
            const namedEntity = testData.namedEntities.filter(n => n.tags.length > 0)[0];
            const createdTags = await db.tag.bulkCreate(namedEntity.tags);

            await namedEntityService.create(namedEntity);
            const createdNamedEntity = await namedEntityService.getByName(namedEntity.name);

            assert.exists(createdNamedEntity);
            assert.equal(createdNamedEntity.name, namedEntity.name);
            assert.equal(createdNamedEntity.description, namedEntity.description);
            assert.equal(createdNamedEntity.imageUrl, namedEntity.imageUrl);
            assert.equal(createdNamedEntity.wikiUrl, namedEntity.wikiUrl);
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

    it("should update the named entity, add 1 new non existing tag", (done) => {
        (async () => {
            const namedEntity = {...testData.namedEntities[0]};
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const tags = [{name: "князі"}, {name: "рюриковичі"}];
            let createdTags = await db.tag.bulkCreate(tags);
            await createdNamedEntity.setTags(createdTags);

            const tagToAdd = {name: "воїни"};
            const newTags = [...createdTags.map(t => t.dataValues), tagToAdd];

            const newName = "Король Данило";
            createdNamedEntity.dataValues.name = newName;
            createdNamedEntity.dataValues.tags = newTags;

            await namedEntityService.update(createdNamedEntity.id, createdNamedEntity.dataValues);
            const updatedNamedEntity = await db.namedEntity.findOne({
                where: {id: createdNamedEntity.id},
                include: [{model: db.tag}]
            });

            assert.equal(updatedNamedEntity.name, newName);
            assert.exists(updatedNamedEntity.tags);

            const newTagsNames = updatedNamedEntity.tags.map(tag => tag.name);

            assert.includeMembers(newTagsNames, newTags.map(tag => tag.name));
            assert.include(newTagsNames, tagToAdd.name);

            const addedTag = await db.tag.findOne({where: {name: tagToAdd.name}});
            assert.exists(addedTag);
            assert.equal(addedTag.name, tagToAdd.name);

            done();
        })();
    });

    it("should update the named entity, add 1 existing tag", (done) => {
        (async () => {
            const namedEntity = {...testData.namedEntities[0]};
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const tags = [{name: "князі"}, {name: "рюриковичі"}, {name: "воїни"}];
            let createdTags = await db.tag.bulkCreate(tags);
            await createdNamedEntity.setTags(createdTags.slice(0, createdTags.length - 1));

            const tagToAdd = createdTags[createdTags.length - 1];
            const newTags = [...createdTags.map(t => t.dataValues), tagToAdd];

            createdNamedEntity.dataValues.tags = newTags;

            await namedEntityService.update(createdNamedEntity.id, createdNamedEntity.dataValues);
            const updatedNamedEntity = await db.namedEntity.findOne({
                where: {id: createdNamedEntity.id},
                include: [{model: db.tag}]
            });

            assert.exists(updatedNamedEntity.tags);

            const newTagsNames = updatedNamedEntity.tags.map(tag => tag.name);
            assert.includeMembers(newTagsNames, newTags.map(tag => tag.name));
            assert.include(newTagsNames, tagToAdd.name);

            done();
        })();
    });

    it("should update the named entity, remove 1 tag (completely)", (done) => {
        (async () => {
            const namedEntity = {...testData.namedEntities[0]};
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const tags = [{name: "князі"}, {name: "рюриковичі"}, {name: "воїни"}];
            let createdTags = await db.tag.bulkCreate(tags);
            await createdNamedEntity.setTags(createdTags);

            const newTags = createdTags.slice(0, createdTags.length - 1);

            createdNamedEntity.dataValues.tags = newTags;

            await namedEntityService.update(createdNamedEntity.id, createdNamedEntity.dataValues);
            const updatedNamedEntity = await db.namedEntity.findOne({
                where: {id: createdNamedEntity.id},
                include: [{model: db.tag}]
            });

            assert.exists(updatedNamedEntity.tags);

            const newTagsNames = updatedNamedEntity.tags.map(tag => tag.name);
            assert.includeMembers(newTagsNames, newTags.map(tag => tag.name));
            assert.notInclude(newTagsNames, createdTags[createdTags.length - 1].name);

            const removedTag = await db.tag.findById(createdTags[createdTags.length - 1].id);
            assert.notExists(removedTag);

            done();
        })();
    });

    it("should update the named entity, remove 1 tag (not completely)", (done) => {
        (async () => {
            const namedEntity = {...testData.namedEntities[0]};
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const anotherNamedEntity = await db.namedEntity.create({...testData.namedEntities[1]});

            const tags = [{name: "князі"}, {name: "рюриковичі"}, {name: "воїни"}];
            let createdTags = await db.tag.bulkCreate(tags);
            await createdNamedEntity.setTags(createdTags);
            await anotherNamedEntity.setTags([createdTags[createdTags.length - 1]]);

            const newTags = createdTags.slice(0, createdTags.length - 1);

            createdNamedEntity.dataValues.tags = newTags;

            await namedEntityService.update(createdNamedEntity.id, createdNamedEntity.dataValues);
            const updatedNamedEntity = await db.namedEntity.findOne({
                where: {id: createdNamedEntity.id},
                include: [{model: db.tag}]
            });

            assert.exists(updatedNamedEntity.tags);

            const newTagsNames = updatedNamedEntity.tags.map(tag => tag.name);
            assert.includeMembers(newTagsNames, newTags.map(tag => tag.name));
            assert.notInclude(newTagsNames, createdTags[createdTags.length - 1].name);

            const removedTag = await db.tag.findById(createdTags[createdTags.length - 1].id);
            assert.exists(removedTag);

            done();
        })();
    });

    it("should not update tags if they are the same", (done) => {
        (async () => {
            const namedEntity = {...testData.namedEntities[0]};
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const tags = [{name: "князі"}, {name: "рюриковичі"}, {name: "королі"}];
            const createdTags = await db.tag.bulkCreate(tags);
            await createdNamedEntity.setTags(createdTags);
            createdNamedEntity.dataValues.tags = createdTags.map(t => {return {id: t.id, name: t.name}});

            await namedEntityService.update(createdNamedEntity.id, createdNamedEntity.dataValues);

            const updatedNamedEntity = await db.namedEntity.findById(createdNamedEntity.id);
            const updatedTags = await updatedNamedEntity.getTags();

            assert.sameMembers(updatedTags.map(t => t.id), createdTags.map(t => t.id));

            done();
        })();
    });

    it("should not create the tag if it already exists", (done) => {
        (async () => {
            const namedEntity = {...testData.namedEntities[0]};
            let createdNamedEntity = await db.namedEntity.create(namedEntity);

            const tags = [{name: "князі"}, {name: "рюриковичі"}, {name: "королі"}];
            const createdTags = await db.tag.bulkCreate(tags);
            createdNamedEntity.dataValues.tags = createdTags.map(t => {return {id: t.id, name: t.name}});

            await namedEntityService.update(createdNamedEntity.id, createdNamedEntity.dataValues);

            const updatedNamedEntity = await db.namedEntity.findById(createdNamedEntity.id);
            const updatedTags = await updatedNamedEntity.getTags();

            assert.sameMembers(updatedTags.map(t => t.id), createdTags.map(t => t.id));

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

    it("should get only locked for parsing named entities", (done) => {
        (async () => {
            const testNamedEntities = testData.namedEntities.slice();
            const lockedCount = 3;

            testNamedEntities.map((namedEntity, i) => {
                namedEntity.isLockedForParsing = i < lockedCount;
            });

            await db.namedEntity.bulkCreate(testNamedEntities);
            const namedEntities = await namedEntityService.getAll({isLockedForParsing: true});

            assert.sameMembers(
                testNamedEntities
                    .filter(namedEntity => namedEntity.isLockedForParsing === true)
                    .map(namedEntity => namedEntity.name),
                namedEntities.map(namedEntity => namedEntity.name));

            done();
        })();
    });

    it("should get only unlocked for parsing named entities", (done) => {
        (async () => {
            const testNamedEntities = testData.namedEntities.slice();
            const unlockedCount = 3;

            testNamedEntities.map((namedEntity, i) => {
                namedEntity.isLockedForParsing = i >= unlockedCount;
            });

            await db.namedEntity.bulkCreate(testNamedEntities);
            const namedEntities = await namedEntityService.getAll({isLockedForParsing: false});

            assert.sameMembers(
                testNamedEntities
                    .filter(namedEntity => namedEntity.isLockedForParsing === false)
                    .map(namedEntity => namedEntity.name),
                namedEntities.map(namedEntity => namedEntity.name));

            done();
        })();
    });

    it("should search only locked for parsing named entities", (done) => {
        (async () => {
            const testNamedEntities = testData.namedEntities.slice();
            const lockedCount = 3;

            testNamedEntities.map((namedEntity, i) => {
                namedEntity.isLockedForParsing = i < lockedCount;
            });

            await db.namedEntity.bulkCreate(testNamedEntities);
            const {data, count} = await namedEntityService.search({isLockedForParsing: true, limit: 100});
            const namedEntities = data;

            assert.equal(count, testNamedEntities.filter(e => e.isLockedForParsing).length);

            assert.sameMembers(
                testNamedEntities
                    .filter(namedEntity => namedEntity.isLockedForParsing === true)
                    .map(namedEntity => namedEntity.name),
                namedEntities.map(namedEntity => namedEntity.name));

            done();
        })();
    });

    it("should search only unlocked for parsing named entities", (done) => {
        (async () => {
            const testNamedEntities = testData.namedEntities.slice();
            const lockedCount = 3;

            testNamedEntities.map((namedEntity, i) => {
                namedEntity.isLockedForParsing = i < lockedCount;
            });

            await db.namedEntity.bulkCreate(testNamedEntities);
            const {data, count} = await namedEntityService.search({isLockedForParsing: false, limit: 100});
            const namedEntities = data;

            assert.equal(count, testNamedEntities.filter(e => e.isLockedForParsing).length);

            assert.sameMembers(
                testNamedEntities
                    .filter(namedEntity => namedEntity.isLockedForParsing === false)
                    .map(namedEntity => namedEntity.name),
                namedEntities.map(namedEntity => namedEntity.name));

            done();
        })();
    });

    it("should throw error when trying to delete the non existing named entity", (done) => {
        (async () => {
            try {
                await namedEntityService.remove(1);
            } catch (error) {
                assert.exists(error);
                assert.equal(error.message, errors.NOT_FOUND.key);

                done();
            }
        })();
    });

    it("should delete the existing named entity", (done) => {
        (async () => {
            const existingNamedEntity = await db.namedEntity.create({...testData.namedEntities[0]});
            await namedEntityService.remove(existingNamedEntity.id);

            const namedEntity = await db.namedEntity.findById(existingNamedEntity.id);
            assert.notExists(namedEntity);

            done();
        })();
    });
});