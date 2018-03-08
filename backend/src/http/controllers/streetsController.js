"use strict";

const streetService = require("../../data/services/streetService");
const constants = require("../constants/constants");
const config = require("config");
const mapper = require("../../helpers/mapper");

module.exports = {
    async searchCityStreets(req, res, next) {
        const search = req.query.search;
        const cityId = parseInt(req.params.cityId);
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;

        const streets = await streetService.search(search, cityId, req.query.offset || 0, limit);
        if(streets) {
            const models = mapper.mapStreetsToModels(streets);
            return res.json({data: models});
        }

        next({status: constants.statusCodes.NOT_FOUND});
    }
};