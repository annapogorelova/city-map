"use strict";

const constants = require("../../app/constants/httpConstants");
const config = require("config");

/**
 * Makes cities controller
 * @param cityService
 * @param mapper
 * @returns {Readonly<{getCity: getCity, createCity: createCity, searchCities: (function(*, *): *)}>}
 */
function makeCitiesController(cityService, mapper) {
    return Object.freeze({
        getCity,
        createCity,
        searchCities
    });

    /**
     * Get city by id
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
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

    /**
     * Create city
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
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

    /**
     * Search cities with pagination
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async function searchCities(req, res) {
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const isPublished = req.user ? null : true;
        const cities = await cityService.search(req.query.search, isPublished, req.query.offset || 0, limit);
        const models = mapper.map(cities, "app.city.list", "api.v1.city.list");
        return res.json({data: models});
    }
}

module.exports = makeCitiesController;