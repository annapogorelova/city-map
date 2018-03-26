"use strict";

const cityService = require("../../data/services/cityService");
const constants = require("../constants/constants");
const mapper = require("../../helpers/mapper");
const config = require("config");

module.exports = {
    async getCity(req, res, next) {
        let params = req.params;
        let id = parseInt(params.id);

        if(isNaN(id)) {
            return res
                .status(constants.statusCodes.BAD_REQUEST)
                .send({message: "Invalid 'id' parameter."});
        }

        const city = await cityService.getById(id);
        if (city) {
            const model = mapper.map(city, "app.city", "api.v1.city");
            return res.json({data: model});
        }

        next();
    },

    async createCity(req, res) {
        let model = req.body;

        // Move this to the validation middleware
        if (!model.name || !model.coordinates || model.coordinates.length < 2) {
            return res.status(constants.statusCodes.BAD_REQUEST).send({message: "Invalid params."});
        }

        const city = mapper.map(model, "api.v1.city", "app.city");
        const createdCity = await cityService.create(city);
        const createdCityModel = mapper.map(createdCity, "app.city", "api.v1.city");
        return res.json({data: createdCityModel});
    },

    async searchCities(req, res) {
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const cities = await cityService.search(req.query.search, req.query.offset || 0, limit);
        const models = mapper.map(cities, "app.city.list", "api.v1.city.list");
        return res.json({data: models});
    }
};