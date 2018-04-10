"use strict";

function makeNamedEntityService(db) {
    return Object.freeze({
        getById,
        getByName,
        create
    });

    function getById(id) {
        return db.namedEntity.findById(id);
    }

    function getByName(name) {
        return db.namedEntity.findOne({where: {name: name}});
    }

    async function create(namedEntity) {
        const existingNamedEntity = await db.namedEntity.findOne({where: {name: namedEntity.name}});
        if (existingNamedEntity) {
            throw new Error("Named entity already exists");
        }

        return db.namedEntity.create(namedEntity);
    }
}

module.exports = makeNamedEntityService;