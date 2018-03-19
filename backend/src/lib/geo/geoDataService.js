"use strict";
const streetService = require("../../data/services/streetService");
const cityService = require("../../data/services/cityService");

class GeoDataService {
    constructor(geoParser, streetWikiService) {
        this.geoParser = geoParser;
        this.streetWikiService = streetWikiService;
    }

    async processCity(city) {
        try {
            const streetsGeoData = await this.geoParser.parse(city.nameEn);
            for(let geoData of streetsGeoData) {
                await this.createStreet(geoData, city);
            }
        } catch(err) {
            throw Error(err);
        }
    }

    async createStreet(streetGeoData, city) {
        const streetInfo = await this.streetWikiService.getStreetInfo(streetGeoData.name, streetGeoData.name);
        let street = Object.assign({}, streetGeoData, streetInfo);
        const createdStreet = await streetService.create(street);
        console.log(`Created ${createdStreet.name}`);
        return cityService.addStreet(city, createdStreet);
    }
}

module.exports = GeoDataService;