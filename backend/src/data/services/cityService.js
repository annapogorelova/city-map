const db = require("../models/index");

module.exports = {
    getAll() {
        return db.city.all();
    },

    getById(id) {
        return db.city.findById(id);
    },

    getByName(name) {
        return db.city.findOne({where: {name: name}});
    },

    getByNameEn(nameEn) {
        return db.city.findOne({where: {nameEn: nameEn}});
    },

    search(search, offset = 0, limit = 5) {
        const selectParams = {offset: offset, limit: limit, order: db.sequelize.col('name')};
        if(search) {
            selectParams['where'] = {name: { $like: `${search}%` }};
        }
        return db.city.findAll(selectParams);
    },

    async create(city) {
        if (!city.name) {
            throw new Error("'name' cannot be empty");
        }

        const existingCity = await db.city.findOne({where: {name: city.name}});
        if (existingCity) {
            throw new Error("City already exists");
        }

        return db.city.create(city);
    }
};