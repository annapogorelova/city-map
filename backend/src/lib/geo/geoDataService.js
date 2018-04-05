"use strict";

class GeoDataService {
    constructor(geoParser, streetWikiService, streetService, personService, mapper) {
        this.geoParser = geoParser;
        this.streetWikiService = streetWikiService;
        this.streetService = streetService;
        this.personService = personService;
        this.mapper = mapper;
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
        const existingStreet = await this.streetService.getByName(streetGeoData.name, city.id);

        if (!existingStreet) {
            const streetInfo = await this.streetWikiService.getStreetInfo(streetGeoData.name, city.name);
            const streetModel = Object.assign({}, streetGeoData, streetInfo.street);

            let street = this.mapper.map(streetModel, "api.v1.street", "app.street");
            street.cityId = city.id;

            if(streetInfo.person) {
                let person = await this.personService.getByName(streetInfo.person.name);
                if(!person) {
                    person = await this.personService.create(streetInfo.person);
                }

                street.personId = person.id;
            } else {
                street.personId = null;
            }

            return this.streetService.create(street, streetModel.ways);
        } else {
            throw new Error(`Street ${existingStreet.name} already exists.`);
        }
    }
}

module.exports = GeoDataService;