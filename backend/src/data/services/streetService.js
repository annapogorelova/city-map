const db = require("../models/index");

module.exports = {
    getById(id) {
        return db.street.findById(id);
    },

    getByName(name) {
        return db.street.findOne({where: {name: name}});
    },

    getByCity(cityId, orderByColumn = "id") {
        return db.street.findAll({
            include: [{
                model: db.city
            }, {
                model: db.person
            }],
            where: {
                cityId: cityId
            },
            order: [[orderByColumn, "ASC"]]
        });
    },

    async searchByCoordinates(coords, cityId, threshold = 0.000025, limit = 1) {
        const location = db.sequelize.literal(`ST_GeomFromText('POINT(${coords[0]} ${coords[1]})')`);
        const attributes = Object.keys(db.street.attributes);
        const distance = db.sequelize.fn('ST_Distance', db.sequelize.literal('street.coordinates'), location);
        attributes.push([distance,'distance']);

        return db.street.findAll({
            attributes: attributes,
            order: distance,
            include: [{
                model: db.person
            }],
            where: {cityId: cityId},
            having: {distance: {$lte: threshold}},
            limit: limit
        });
    },

    search(search, cityId = null, offset = 0, limit = 5) {
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
    },

    async create(street) {
        const existingStreet = await db.street.findOne({where: {name: street.name}});
        if (existingStreet) {
            throw new Error("Street already exists");
        }

        return db.street.create(street);
    }
};