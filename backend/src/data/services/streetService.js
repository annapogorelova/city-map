"use strict";

const {optional} = require("tooleks");
const utils = require("../../app/utils");

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

    async function searchByCoordinates(coordinates, threshold = 0.0002, limit = 1) {
        const location = db.sequelize.fn("ST_GeomFromText",
            db.sequelize.literal(`'POINT(${coordinates[0]} ${coordinates[1]})'`), 4326);
        const asText = db.sequelize.fn("ST_AsText", db.sequelize.literal("coordinates"));
        const geomFromText = db.sequelize.fn("ST_GeomFromText", asText, 4326);
        const buffer = db.sequelize.fn("ST_Buffer", geomFromText, threshold);
        const stWithin = db.sequelize.fn("ST_Within", location, buffer);

        const ways = await db.way.findAll({
            where: db.sequelize.where(stWithin, 1),
            limit: limit
        });

        return optional(() => ways[0].getStreets({
            include: [
                {model: db.namedEntity, include: [{model: db.tag}]},
                {model: db.way}
            ]
        }), []);
    }

    function search(search, cityId = null, offset = 0, limit = 5) {
        let selectParams = {
            offset: offset,
            limit: limit,
            order: db.sequelize.col("name"),
            include: [
                {model: db.namedEntity, include: [{model: db.tag}]},
                {model: db.way}
            ]
        };

        if (cityId) {
            selectParams["where"] = {cityId: cityId};
        }

        if (search) {
            selectParams["where"] = Object.assign(selectParams["where"] || {},
                {name: {$like: `${search}%`}});
        }
        return db.street.findAll(selectParams).then(streets => getPlainList(streets));
    }

    async function create(street, ways) {
        const existingStreet = await getByName(street.name, street.cityId);
        if (existingStreet) {
            throw new Error("Street already exists");
        }

        const createdStreet = await db.street.create(street);
        if(ways && ways.length) {
            const wayModels = ways.map(w => {return {coordinates: w};});
            const createdWays = await db.way.bulkCreate(wayModels);
            await createdStreet.setWays(createdWays);
        }

        return createdStreet;
    }

    async function update(street) {
        const existingStreet = await getById(street.id);
        if(!existingStreet) {
            throw Error("Street does not exist");
        }

        return db.street.update(street, {where: {id: street.id}});
    }

    function getPlainList(entities) {
        return optional(() => entities.map(entity => getPlain(entity)), null);
    }

    function getPlain(entity) {
        return optional(() => entity.get({ plain: true }), null);
    }
}

module.exports = makeStreetService;
