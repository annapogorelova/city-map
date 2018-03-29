"use strict";

function makePersonService(db) {
    return Object.freeze({
        getById,
        getByName,
        create
    });

    function getById(id) {
        return db.person.findById(id);
    }

    function getByName(name) {
        return db.person.findOne({where: {name: name}});
    }

    async function create(person) {
        const existingPerson = await db.person.findOne({where: {name: person.name}});
        if (existingPerson) {
            throw new Error("Person already exists");
        }

        return db.person.create(person);
    }
}

module.exports = makePersonService;