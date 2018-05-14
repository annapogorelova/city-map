"use strict";

const {optional} = require("tooleks");
const utils = require("../../app/utils");
const {errors, commonConstants} = require("../../app/constants/index");
const stringUtils = require("../../utils/stringUtils");

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
        }).then(street => optional(() => getPlain(street)), null);
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
        }).then(streets => getPlainList(streets));
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

        const location = db.sequelize.fn("ST_GeomFromText",
            db.sequelize.literal(`'POINT(${coordinates[0]} ${coordinates[1]})'`), 4326);

        const query = `
            SELECT street.id     
            FROM way
	        inner join street on way.streetId = street.id

            WHERE street.cityId = :cityId and
                ST_Within(ST_GeomFromText(${location.args[0].val}, 4326),
	            ST_Buffer(ST_GeomFromText(ST_AsText(way.coordinates), 4326), :threshold)) = 1
	            group by street.id, way.id;`;

        const options = {
            type: db.sequelize.QueryTypes.SELECT,
            replacements: {
                cityId: cityId,
                threshold: threshold
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

    async function search(search, cityId = null, offset = 0, limit = 5) {
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
            }).then(rows => getPlainList(rows))
        ]);

        return {
            count: results[0],
            data: results[1]
        };
    }

    async function create(street, ways) {
        const existingStreet = await getByName(street.name, street.cityId);
        if (existingStreet) {
            throw new Error(errors.ALREADY_EXISTS.key);
        }

        street.name = stringUtils.cleanText(street.name);
        street.description = stringUtils.formatText(street.description, commonConstants.MAX_DESCRIPTION_LENGTH);

        const createdStreet = await db.street.create(street);
        if (ways && ways.length) {
            const wayModels = ways.map(w => {
                return {streetId: createdStreet.id, coordinates: w};
            });

            await db.way.bulkCreate(wayModels);
        }

        return createdStreet;
    }

    async function update(id, newValues) {
        const existingStreet = await getById(id).then(entity => optional(() => entity.get({plain: true})));
        if (!existingStreet) {
            throw Error(errors.NOT_FOUND.key);
        }

        let streetProps = Object.getOwnPropertyNames(existingStreet);

        newValues.namedEntityId = newValues.namedEntityId || null;
        if (existingStreet.namedEntityId !== newValues.namedEntityId) {
            await updateNamedEntity(existingStreet.namedEntityId, newValues.namedEntityId);
        }

        for (let propName of streetProps) {
            if (newValues[propName] !== undefined &&
                existingStreet[propName] !== newValues[propName]) {
                existingStreet[propName] = newValues[propName];
            }
        }

        existingStreet.updatedAt = Date.now();

        return db.street.update(existingStreet, {where: {id: id}});
    }

    async function updateNamedEntity(existingNamedEntityId, newNamedEntityId) {
        if (newNamedEntityId) {
            await validateNamedEntity(newNamedEntityId);
        } else {
            await tryRemoveNamedEntity(existingNamedEntityId);
        }
    }

    async function validateNamedEntity(namedEntityId) {
        const existingNamedEntity = await db.namedEntity.findById(namedEntityId);
        if (!existingNamedEntity) {
            throw Error(errors.NOT_FOUND.key);
        }
    }

    async function tryRemoveNamedEntity(namedEntityId) {
        const existingNamedEntity = await db.namedEntity.findById(namedEntityId);
        const streetsCount = await existingNamedEntity.countStreets();
        if (streetsCount < 2) {
            return existingNamedEntity.destroy();
        }
    }

    function getPlainList(entities) {
        return optional(() => entities.map(entity => getPlain(entity)), null);
    }

    function getPlain(entity) {
        return optional(() => entity.get({plain: true}), null);
    }
}

module.exports = makeStreetService;
