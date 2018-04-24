"use strict";

const {optional} = require("tooleks");

function makeNamedEntityService(db) {
    return Object.freeze({
        getById,
        getByName,
        create
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
        }).then(entity => optional(() => entity.get({ plain: true }), null));
    }

    async function create(namedEntity, tags) {
        const existingNamedEntity = await db.namedEntity.findOne({where: {name: namedEntity.name}});
        if (existingNamedEntity) {
            throw new Error("Named entity already exists");
        }

        const createdNamedEntity = await db.namedEntity.create(namedEntity);
        if(tags && tags.length) {
            const createdTags = await Promise.all(tags.map(tag => createTag(tag)));
            await createdNamedEntity.setTags(createdTags);
        }

        return createdNamedEntity;
    }

    async function createTag(tagName) {
        let existingTag = await db.tag.findOne({where: {name: tagName}});
        if(!existingTag) {
            existingTag = await db.tag.create({name: tagName});
        }

        return existingTag;
    }
}

module.exports = makeNamedEntityService;