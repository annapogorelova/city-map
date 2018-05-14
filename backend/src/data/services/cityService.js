"use strict";

function makeCityService(db) {
    return Object.freeze({
        getById,
        getByName,
        getByNameEn,
        search,
        create
    });

    function getById(id) {
        return db.city.findById(id);
    }

    function getByName(name) {
        return db.city.findOne({where: {name: name}});
    }

    function getByNameEn(nameEn) {
        return db.city.findOne({where: {nameEn: nameEn}});
    }

    function search(search, isPublished = null, offset = 0, limit = 5) {
        const selectParams = {offset: offset, limit: limit, order: [["name"]]};
        if(isPublished !== null) {
            selectParams["where"] = {isPublished: isPublished};
        }

        if(search) {
            selectParams["where"] = {name: { $like: `${search}%` }};
        }
        return db.city.findAll(selectParams);
    }

    async function create(city) {
        if (!city.name) {
            throw new Error("'name' cannot be empty");
        }

        const existingCity = await db.city.findOne({where: {name: city.name}});
        if (existingCity) {
            throw new Error("City already exists");
        }

        return db.city.create(city);
    }
}

module.exports = makeCityService;