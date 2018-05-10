"use strict";

const {optional} = require("tooleks");
const stringUtils = require("../../utils/stringUtils");
const {commonConstants, errors} = require("../../app/constants/index");
const _ = require("lodash");

function makeNamedEntityService(db) {
    return Object.freeze({
        getById,
        getByName,
        getAll,
        search,
        create,
        update,
        remove
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

    function getAll({isLockedForParsing = null} = {}) {
        let selectParams = {
            order: db.sequelize.col("name")
        };

        if(isLockedForParsing !== null) {
            selectParams["where"] = {
                isLockedForParsing: isLockedForParsing
            };
        }

        return db.namedEntity.findAll(selectParams).then(entities => entities.map(entity => entity.get({plain: true})));
    }

    async function search({search, offset, limit, isLockedForParsing = null} = {}) {
        let selectParams = {
            offset: offset,
            limit: limit,
            order: db.sequelize.col("name"),
            where: {}
        };

        if(search) {
            selectParams["where"] = {name: {$like: `%${search}%`}};
        }

        if(isLockedForParsing !== null) {
            selectParams["where"] = {isLockedForParsing: isLockedForParsing};
        }

        const results = await Promise.all([
            db.namedEntity.count(selectParams),
            db.namedEntity.findAll({...selectParams, include: [{model: db.tag}]})
                .then(entities => entities.map(entity => entity.get({plain: true})))
        ]);

        return {
            count: results[0],
            data: results[1]
        };
    }

    async function create(namedEntity) {
        const existingNamedEntity = await db.namedEntity.findOne({where: {name: namedEntity.name}});
        if (existingNamedEntity) {
            throw new Error(errors.ALREADY_EXISTS.key);
        }

        namedEntity.name = stringUtils.cleanText(namedEntity.name);
        namedEntity.description = stringUtils.formatText(namedEntity.description, commonConstants.MAX_DESCRIPTION_LENGTH);

        const createdNamedEntity = await db.namedEntity.create(namedEntity);
        if (namedEntity.tags && namedEntity.tags.length) {
            const createdTags = await Promise.all(namedEntity.tags.map(tag => createTag(tag)));
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

    async function update(id, {tags, ...newValues}) {
        let existingNamedEntity = await getById(id);
        if (!existingNamedEntity) {
            throw Error(errors.NOT_FOUND.key);
        }

        let namedEntityProps = Object.getOwnPropertyNames(existingNamedEntity.dataValues);

        for(let propName of namedEntityProps) {
            if(newValues[propName] !== undefined &&
                existingNamedEntity.dataValues[propName] !== newValues[propName]) {
                existingNamedEntity.dataValues[propName] = newValues[propName];
            }
        }

        if(tags) {
            await updateTags(existingNamedEntity, tags);
        }

        existingNamedEntity.updatedAt = Date.now();
        return db.namedEntity.update(existingNamedEntity.dataValues, {where: {id: id}});
    }

    async function updateTags(namedEntity, tags) {
        const existingTags = await namedEntity.getTags();

        if(_.isEqual(existingTags.map(t => t.id).sort(), tags.map(t => t.id).sort())) {
            return;
        }

        const tagsToAdd = tags.filter(t => !t.id || existingTags.every(et => et.id !== t.id));
        const tagsToRemove = existingTags.filter(et => tags.every(t => t.id !== et.id));

        if(tagsToAdd.length) {
            await addTags(namedEntity, tagsToAdd);
        }

        if(tagsToRemove.length) {
            await removeTags(namedEntity, tagsToRemove);
        }
    }

    async function addTags(namedEntity, tags) {
        for (let tag of tags) {
            let existingTag;

            if(!tag.id) {
                existingTag = await db.tag.findOne({where: {name: tag.name}});
                if(!existingTag) {
                    existingTag = await db.tag.create({name: tag.name});
                }
            } else {
                existingTag = await db.tag.findById(tag.id);
            }

            await namedEntity.addTag(existingTag);
        }
    }

    async function removeTags(namedEntity, tagsToRemove) {
        for (let tag of tagsToRemove) {
            const existingTag = await db.tag.findById(tag.id);
            await namedEntity.removeTag(existingTag);

            const namedEntities = await existingTag.getNamedEntities();
            if(!namedEntities.length) {
                await existingTag.destroy();
            }
        }
    }

    async function remove(id) {
        let existingNamedEntity = await getById(id);
        if (!existingNamedEntity) {
            throw Error(errors.NOT_FOUND.key);
        }

        return db.namedEntity.destroy({where: {id: id}});
    }
}

module.exports = makeNamedEntityService;