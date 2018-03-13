"use strict";
const streetService = require("../../data/services/streetService");
const cityService = require("../../data/services/cityService");

class GeoDataService {
    constructor(geoParser) {
        this.geoParser = geoParser;
    }

    async processCity(city) {
        try {
            const streets = await this.geoParser.parse(city.nameEn);
            const createdStreets = await streetService.bulkCreate(streets);
            await cityService.addStreets(city, createdStreets);
            return createdStreets;
        } catch(err) {
            throw Error(err);
        }
    }
}

module.exports = GeoDataService;