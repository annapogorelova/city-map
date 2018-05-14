"use strict";

const config = require("config");
const constants = require("../../app/constants/httpConstants");

function makeStreetsController(streetService, mapper) {
    return Object.freeze({
        searchCityStreets,
        searchStreetsByCoordinates,
        update
    });

    async function searchCityStreets(req, res) {
        const search = req.query.search;
        const cityId = parseInt(req.params.cityId);
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const {count, data} = await streetService.search(search, cityId, offset, limit);
        const models = mapper.map(data, "app.street.list", "api.v1.street.list");
        return res.json({data: models, count: count});
    }

    async function searchStreetsByCoordinates(req, res) {
        const cityId = parseInt(req.query.cityId);
        const coordinates = req.query.coordinates;
        const street = await streetService.searchByCoordinates(cityId, coordinates);
        if(street) {
            const model = mapper.map(street, "app.street", "api.v1.street");
            return res.json({data: model});
        }

        return res.json({data: null});
    }

    async function update(req, res, next) {
        const id = parseInt(req.params.id);
        const street = req.body;

        try {
            await streetService.update(id, street);
            return res
                .status(constants.statusCodes.OK)
                .send({ message: "Street was successfully updated." });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = makeStreetsController;