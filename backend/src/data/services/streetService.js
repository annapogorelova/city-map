const db = require("../models/index");

module.exports = {
    getById(id) {
        return db.street.findById(id);
    },

    getByName(name) {
        return db.street.findOne({where: {name: name}});
    },

    getByCity(cityId) {
        return db.street.findAll({
            include: {
                model: db.city,
                through: {where: {id: cityId}},
                attributes: ["id"]
            }
        });
    },

    async searchByCoordinates(coords, cityId, threshold = 0.000025, limit = 1) {
        const location = db.sequelize.literal(`ST_GeomFromText('POINT(${coords[0]} ${coords[1]})')`);
        const attributes = Object.keys(db.street.attributes);
        const distance = db.sequelize.fn('ST_Distance', db.sequelize.literal('street.coords'), location);
        attributes.push([distance,'distance']);

        return db.street.findAll({
            attributes: attributes,
            order: distance,
            include: {
                model: db.city,
                through: {where: {id: cityId}},
                attributes: ["id"]
            },
            having: {distance: {$lte: threshold}},
            limit: limit,
            logging: console.log
        });
    },

    search(search, cityId = null, offset = 0, limit = 5) {
        let selectParams = {
            offset: offset,
            limit: limit,
            order: db.sequelize.col("name")
        };

        if (cityId) {
            selectParams["include"] = [{
                model: db.city,
                through: {where: {id: cityId}},
                attributes: ["id"]
            }];
        }

        if (search) {
            selectParams["where"] = {name: {$like: `${search}%`}};
        }
        return db.street.findAll(selectParams);
    },

    async create(street) {
        if (!street.name) {
            throw new Error("'name' cannot be empty");
        }

        const existingStreet = await db.street.findOne({where: {name: street.name}});
        if (existingStreet) {
            throw new Error("Street already exists");
        }

        return db.street.create(street);
    },

    async bulkCreate(streets) {
        return db.street.bulkCreate(streets);
    }
};