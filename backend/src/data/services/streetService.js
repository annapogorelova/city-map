"use strict";

const {optional} = require("tooleks");

function makeStreetService(db) {
    return Object.freeze({
        getById,
        getByName,
        getByCity,
        searchByCoordinates,
        search,
        create
    });

    function getById(id) {
        return db.street.findById(id);
    }

    function getByName(name) {
        return db.street.findOne({where: {name: name}});
    }

    function getByCity(cityId, orderByColumn = "id") {
        return db.street.findAll({
            include: [{
                model: db.city
            }, {
                model: db.person
            }, {
                model: db.way,
            }],
            where: {
                cityId: cityId
            },
            order: [[orderByColumn, "ASC"]]
        });
    }

    async function searchByCoordinates(coordinates, threshold = 0.0001, limit = 1) {
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

        return optional(() => ways[0].getStreets({include: [{model: db.person}, {model: db.way}]}), []);
    }

    function search(search, cityId = null, offset = 0, limit = 5) {
        let selectParams = {
            offset: offset,
            limit: limit,
            order: db.sequelize.col("name"),
            include: [{
                model: db.person
            }]
        };

        if (cityId) {
            selectParams["where"] = {cityId: cityId};
        }

        if (search) {
            selectParams["where"] = Object.assign(selectParams["where"] || {},
                {name: {$like: `${search}%`}});
        }
        return db.street.findAll(selectParams);
    }

    async function create(street, ways) {
        const existingStreet = await db.street.findOne({where: {name: street.name}});
        if (existingStreet) {
            throw new Error("Street already exists");
        }

        const createdStreet = await db.street.create(street);
        if(ways) {
            const wayModels = ways.map(w => {return {coordinates: w};});
            const createdWays = await db.way.bulkCreate(wayModels);
            await createdStreet.setWays(createdWays);
        }

        return createdStreet;
    }
}

module.exports = makeStreetService;
