"use strict";

const constants = require("../constants/constants");
const config = require("config");

function makeCitiesController(cityService, mapper) {
    return Object.freeze({
        getCity,
        createCity,
        searchCities
    });

    async function getCity(req, res, next) {
        let params = req.params;
        let id = parseInt(params.id);

        try {
            const city = await cityService.getById(id);
            if (city) {
                const model = mapper.map(city, "app.city", "api.v1.city");
                return res.json({data: model});
            } else {
                next();
            }
        } catch (error) {
            next(error);
        }
    }

    async function createCity(req, res) {
        let model = req.body;

        // Move this to the validation middleware
        if (!model.name || !model.coordinates || model.coordinates.length < 2) {
            return res.status(constants.statusCodes.BAD_REQUEST).send({message: "Invalid params."});
        }

        const city = mapper.map(model, "api.v1.city", "app.city");
        const createdCity = await cityService.create(city);
        const createdCityModel = mapper.map(createdCity, "app.city", "api.v1.city");
        return res.json({data: createdCityModel});
    }

    async function searchCities(req, res) {
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const isPublished = req.user ? null : true;
        const cities = await cityService.search(req.query.search, isPublished, req.query.offset || 0, limit);
        const models = mapper.map(cities, "app.city.list", "api.v1.city.list");
        return res.json({data: models});
    }
}

module.exports = makeCitiesController;