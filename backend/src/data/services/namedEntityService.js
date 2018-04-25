"use strict";

const {optional} = require("tooleks");

function makeNamedEntityService(db) {
    return Object.freeze({
        getById,
        getByName,
        getAll,
        create,
        update
    });

    function getById(id) {
        return db.namedEntity.findById(id);
    }

    function getByName(name) {
        return db.namedEntity.findOne({
            where: {name: name},
            include: [{
                model: db.tag
            }]
        }).then(entity => optional(() => entity.get({plain: true}), null));
    }

    function getAll() {
        return db.namedEntity.findAll({}).then(entities => entities.map(entity => entity.get({plain: true})));
    }

    async function create(namedEntity, tags) {
        const existingNamedEntity = await db.namedEntity.findOne({where: {name: namedEntity.name}});
        if (existingNamedEntity) {
            throw new Error("Named entity already exists");
        }

        const createdNamedEntity = await db.namedEntity.create(namedEntity);
        if (tags && tags.length) {
            const createdTags = await Promise.all(tags.map(tag => createTag(tag)));
            await createdNamedEntity.setTags(createdTags);
        }

        return createdNamedEntity;
    }

    async function createTag(tagName) {
        let existingTag = await db.tag.findOne({where: {name: tagName}});
        if (!existingTag) {
            existingTag = await db.tag.create({name: tagName});
        }

        return existingTag;
    }

    async function update(namedEntity, tags) {
        let existingNamedEntity = await getById(namedEntity.id);
        if (!existingNamedEntity) {
            throw Error("Named entity does not exist");
        }

        if(tags) {
            await updateTags(existingNamedEntity, tags);
        }

        return db.namedEntity.update(namedEntity, {where: {id: namedEntity.id}});
    }

    async function updateTags(namedEntity, tags) {
        const existingTags = await namedEntity.getTags();

        for (let tag of tags) {
            if (!existingTags.filter(t => t.name === tag).length) {
                let existingTag = await db.tag.findOne({where: {name: tag}});
                if (!existingTag) {
                    existingTag = await db.tag.create({name: tag});
                }

                await namedEntity.addTag(existingTag);
            }
        }
    }
}

module.exports = makeNamedEntityService;