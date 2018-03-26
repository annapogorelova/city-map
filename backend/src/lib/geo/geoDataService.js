"use strict";
const streetService = require("../../data/services/streetService");
const personService = require("../../data/services/personService");
const mapper = require("../../helpers/mapper");

class GeoDataService {
    constructor(geoParser, streetWikiService) {
        this.geoParser = geoParser;
        this.streetWikiService = streetWikiService;
    }

    async processCity(city) {
        try {
            const streetsGeoData = await this.geoParser.parse(city.nameEn);
            for (let geoData of streetsGeoData) {
                try {
                    const street = await this.createStreet(geoData, city);
                    console.log(`Created ${street.name}.`);
                } catch(err) {
                    console.log(err.message);
                }
            }
        } catch (err) {
            throw Error(err);
        }
    }

    async createStreet(streetGeoData, city) {
        const existingStreet = await streetService.getByName((streetGeoData.name));

        if (!existingStreet) {
            const streetInfo = await this.streetWikiService.getStreetInfo(streetGeoData.name, city.name);
            const streetModel = Object.assign({}, streetGeoData, streetInfo.street);

            let street = mapper.map(streetModel, "api.v1.street", "app.street");
            street.cityId = city.id;

            if(streetInfo.person) {
                let person = await personService.getByName(streetInfo.person.name);
                if(!person) {
                    person = await personService.create(streetInfo.person);
                }

                street.personId = person.id;
            } else {
                street.personId = null;
            }

            return streetService.create(street);
        } else {
            throw new Error(`Street ${existingStreet.name} already exists.`);
        }
    }
}

module.exports = GeoDataService;