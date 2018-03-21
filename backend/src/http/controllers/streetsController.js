"use strict";

const streetService = require("../../data/services/streetService");
const config = require("config");
const mapper = require("../../helpers/mapper");

module.exports = {
    async searchCityStreets(req, res) {
        const search = req.query.search;
        const cityId = parseInt(req.params.cityId);
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const streets = await streetService.search(search, cityId, req.query.offset || 0, limit);
        const models = mapper.mapStreetsToModels(streets);
        return res.json({data: models});
    },

    async searchStreetsByCoordinates(req, res) {
        const cityId = parseInt(req.query.cityId);
        const coordinates = req.query.coordinates;
        const streets = await streetService.searchByCoordinates(coordinates, cityId);
        const models = mapper.mapStreetsToModels(streets);
        return res.json({data: models});
    }
};