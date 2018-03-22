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
                await this.createStreet(geoData, city);
            }
        } catch (err) {
            throw Error(err);
        }
    }

    async createStreet(streetGeoData, city) {
        const existingStreet = await streetService.getByName((streetGeoData.name));

        if (!existingStreet) {
            const streetInfo = await this.streetWikiService.getStreetInfo(streetGeoData.name, streetGeoData.name);
            const streetModel = Object.assign({}, streetGeoData, streetInfo.street);

            let street = mapper.mapModelToStreet(streetModel);
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

            const createdStreet = await streetService.create(street);
            console.log(`Created ${createdStreet.name}`);
        } else {
            console.log(`${streetGeoData.name} already exists.`);
            return Promise.resolve({});
        }
    }
}

module.exports = GeoDataService;