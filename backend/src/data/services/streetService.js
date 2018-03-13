const db = require("../models/index");
const op = db.Sequelize.Op;

module.exports = {
    getById(id) {
        return db.street.findById(id);
    },

    getByName(name) {
        return db.street.findOne({where: {name: name}});
    },

    search(search, cityId = null, offset = 0, limit = 5) {
        let selectParams = {
            offset: offset,
            limit: limit,
            order: db.sequelize.col('name')
        };

        if(cityId) {
            selectParams['include'] = [{
                model: db.city,
                through: { where: {id: cityId}},
                attributes: ['id']
            }];
        }

        if(search) {
            selectParams['where'] = {name: { [op.like]: `${search}%` }};
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