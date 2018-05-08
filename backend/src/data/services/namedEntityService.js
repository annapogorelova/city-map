"use strict";

const {optional} = require("tooleks");
const {errors} = require("../../app/constants/index");
const stringUtils = require("../../utils/stringUtils");
const {common} = require("../../app/constants/index");

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
        namedEntity.description = stringUtils.formatText(namedEntity.description, common.maxDescriptionLength);

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

    async function update(id, newValues, tags) {
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

    async function remove(id) {
        let existingNamedEntity = await getById(id);
        if (!existingNamedEntity) {
            throw Error(errors.NOT_FOUND.key);
        }

        return db.namedEntity.destroy({where: {id: id}});
    }
}

module.exports = makeNamedEntityService;