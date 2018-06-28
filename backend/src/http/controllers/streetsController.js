"use strict";

const config = require("config");
const constants = require("../../app/constants/httpConstants");

function makeStreetsController(streetService, mapper) {
    return Object.freeze({
        searchCityStreets,
        searchStreetsByCoordinates,
        update
    });

    async function searchCityStreets(req, res, next) {
        try {
            const search = req.query.search;
            const cityId = parseInt(req.params.cityId);
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
            const {count, data} = await streetService.search({
                search: search,
                cityId: cityId,
                offset: offset,
                limit: limit
            });
            const models = await mapper.map(data, "app.street.list", "api.v1.street.list");
            return res.json({data: models, count: count});
        } catch (error) {
            next(error);
        }
    }

    async function searchStreetsByCoordinates(req, res, next) {
        try {
            const street = await streetService.searchByCoordinates({
                cityId: parseInt(req.query.cityId),
                lat: parseFloat(req.query.lat),
                lng: parseFloat(req.query.lng)
            });

            if (street) {
                const model = await mapper.map(street, "app.street", "api.v1.street");
                return res.json({data: model});
            }

            return res.json({data: null});
        } catch (error) {
            next(error);
        }
    }

    async function update(req, res, next) {
        const id = parseInt(req.params.id);
        const street = req.body;

        try {
            await streetService.update(id, street);
            return res
                .status(constants.statusCodes.OK)
                .send({message: "Street was successfully updated."});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = makeStreetsController;