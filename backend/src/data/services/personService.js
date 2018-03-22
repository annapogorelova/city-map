const db = require("../models/index");

module.exports = {
    getById(id) {
        return db.person.findById(id);
    },

    getByName(name) {
        return db.person.findOne({where: {name: name}});
    },

    async create(person) {
        const existingPerson = await db.person.findOne({where: {name: person.name}});
        if (existingPerson) {
            throw new Error("Person already exists");
        }

        return db.person.create(person);
    }
};