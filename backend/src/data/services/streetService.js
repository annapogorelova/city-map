"use strict";

const {optional} = require("tooleks");
const utils = require("../../app/utils");
const {errors, commonConstants} = require("../../app/constants/index");
const stringUtils = require("../../utils/stringUtils");
const _ = require("lodash");

function makeStreetService(db) {
    return Object.freeze({
        getById,
        getByName,
        getBySimilarName,
        getByCity,
        searchByCoordinates,
        search,
        create,
        update
    });

    function getById(id) {
        return db.street.findById(id);
    }

    function getByName(name, cityId) {
        let filter = {name: name};
        if (cityId) {
            filter["cityId"] = cityId;
        }

        return db.street.findOne({
            where: filter, include: [{
                model: db.namedEntity
            }]
        });
    }

    function getBySimilarName(name) {
        let filter = db.sequelize.where(
            db.sequelize.literal("MATCH (`street`.`name`) AGAINST (:name IN BOOLEAN MODE)"),
            {$gt: 0});
        let query = utils.extractStreetName(name);

        return db.street.findAll({
            where: filter,
            replacements: {
                name: `+"${query}"`
            },
            include: [{
                model: db.namedEntity
            }]
        });
    }

    function getByCity(cityId, orderByColumn = "id") {
        return db.street.findAll({
            include: [{
                model: db.city
            }, {
                model: db.namedEntity
            }, {
                model: db.way,
            }],
            where: {
                cityId: cityId
            },
            order: [[orderByColumn, "ASC"]]
        });
    }

    async function searchByCoordinates(cityId, coordinates, threshold = 0.0003) {
        if(isNaN(cityId)) {
            throw new Error(errors.BAD_REQUEST.key);
        }

        const query = `
            SELECT street.id     
            FROM way
	        INNER JOIN street ON way.streetId = street.id
            WHERE street.cityId = :cityId and
                ST_Within(ST_GeomFromText(:location, 4326),
	            ST_Buffer(ST_GeomFromText(ST_AsText(way.coordinates), 4326), :threshold)) = 1
	            group by street.id, way.id;`;

        const options = {
            type: db.sequelize.QueryTypes.SELECT,
            replacements: {
                cityId: cityId,
                threshold: threshold,
                location: `POINT(${coordinates[0]} ${coordinates[1]})`
            }
        };
        return db.sequelize.query(query, options).then(data => {
            if(!data.length) {
                return null;
            }

            return db.street.findOne({
                where: {id: data[0].id},
                include: [{
                    model: db.way
                }, {
                    model: db.namedEntity,
                    include: [{
                        model: db.tag
                    }]
                }]
            });
        });
    }

    async function search({search, cityId = null, offset = 0, limit = 5} = {}) {
        let selectParams = {
            offset: offset,
            limit: limit,
            order: db.sequelize.col("name")
        };

        if (cityId) {
            selectParams["where"] = {cityId: cityId};
        }

        if (search) {
            selectParams["where"] = Object.assign(selectParams["where"] || {},
                {name: {$like: `%${search}%`}});
        }

        const results = await Promise.all([
            db.street.count(selectParams),
            db.street.findAll({
                ...selectParams,
                include: [
                    {model: db.namedEntity, include: [{model: db.tag}]},
                    {model: db.way}
                ]
            })
        ]);

        return {
            count: results[0],
            data: results[1]
        };
    }

    async function create({street, namedEntities, ways}) {
        const existingStreet = await getByName(street.name, street.cityId);
        if (existingStreet) {
            throw new Error(errors.ALREADY_EXISTS.key);
        }

        street.name = stringUtils.cleanText(street.name);
        street.description = stringUtils.formatText(street.description, commonConstants.MAX_DESCRIPTION_LENGTH);

        const createdStreet = await db.street.create(street);

        if(optional(() => namedEntities.length)) {
            await createdStreet.setNamedEntities(namedEntities);
        }

        if (ways && ways.length) {
            const wayModels = ways.map(w => {
                return {streetId: createdStreet.id, coordinates: w};
            });

            await db.way.bulkCreate(wayModels);
        }

        return createdStreet;
    }

    async function update(id, {namedEntities, ...newValues}) {
        const existingStreet = await getById(id);
        if (!existingStreet) {
            throw Error(errors.NOT_FOUND.key);
        }

        let streetProps = Object.getOwnPropertyNames(existingStreet.dataValues);

        for (let propName of streetProps) {
            if (newValues[propName] !== undefined &&
                existingStreet.dataValues[propName] !== newValues[propName]) {
                existingStreet.dataValues[propName] = newValues[propName];
            }
        }

        if(namedEntities) {
            await updateNamedEntities(existingStreet, namedEntities);
        }

        existingStreet.updatedAt = Date.now();

        return db.street.update(existingStreet.dataValues, {where: {id: id}});
    }

    async function updateNamedEntities(street, namedEntities) {
        const existingNamedEntities = await street.getNamedEntities();

        if(_.isEqual(existingNamedEntities.map(t => t.id).sort(), namedEntities.map(t => t.id).sort())) {
            return;
        }

        const namedEntitiesToAdd = namedEntities.filter(t => !t.id || existingNamedEntities.every(et => et.id !== t.id));
        const namedEntitiesToRemove = existingNamedEntities.filter(et => namedEntities.every(t => t.id !== et.id));

        if(namedEntitiesToAdd.length) {
            await addNamedEntities(street, namedEntitiesToAdd);
        }

        if(namedEntitiesToRemove.length) {
            await removeNamedEntities(street, namedEntitiesToRemove);
        }
    }

    async function addNamedEntities(street, namedEntities) {
        for (let namedEntity of namedEntities) {
            let existingNamedEntity = await db.namedEntity.findOne({where: {name: namedEntity.name}});

            if(!existingNamedEntity) {
                throw Error(errors.NOT_FOUND.key);
            }

            await street.addNamedEntity(existingNamedEntity);
        }
    }

    async function removeNamedEntities(street, namedEntitiesToRemove) {
        for (let namedEntity of namedEntitiesToRemove) {
            const existingNamedEntity = await db.namedEntity.findById(namedEntity.id);
            await street.removeNamedEntity(existingNamedEntity);
        }
    }
}

module.exports = makeStreetService;
