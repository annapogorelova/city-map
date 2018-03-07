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
            const model = mapper.mapCityToModel(city);
            return res.json({data: model});
        }

        next();
    },

    async createCity(req, res) {
        let model = req.body;

        // Move this to the validation middleware
        if (!model.name || !model.coords || model.coords.length < 2) {
            return res.status(constants.statusCodes.BAD_REQUEST).send({message: "Invalid params."});
        }

        const city = mapper.mapModelToCity(model);
        const createdCity = await cityService.create(city);

        if (createdCity) {
            let model = mapper.mapCityToModel(createdCity);
            return res.json({data: model});
        }
    },

    async searchCities(req, res) {
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const cities = await cityService.search(req.query.search, req.query.offset || 0, limit);

        let models = [];
        if(cities) {
            models = mapper.mapCitiesToModels(cities);
        }

        return res.json({data: models});
    }
};