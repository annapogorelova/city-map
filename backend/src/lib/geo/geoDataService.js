"use strict";

const {optional} = require("tooleks");

class GeoDataService {
    constructor(geoParser, wikiService, streetService, namedEntityService, mapper) {
        this.geoParser = geoParser;
        this.wikiService = wikiService;
        this.streetService = streetService;
        this.namedEntityService = namedEntityService;
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
            const streetInfo = await this.wikiService.getStreetInfo(streetGeoData.name, city.name);
            const streetModel = Object.assign({}, streetGeoData, optional(() => streetInfo.street, {}));

            let street = this.mapper.map(streetModel, "api.v1.street", "app.street");
            street.cityId = city.id;

            if(streetInfo.namedEntity) {
                let namedEntity = await this.namedEntityService.getByName(streetInfo.namedEntity.name);
                if(!namedEntity) {
                    namedEntity = await this.namedEntityService.create(streetInfo.namedEntity);
                }

                street.namedEntityId = namedEntity.id;
            } else {
                street.namedEntityId = null;
            }

            return this.streetService.create(street, streetModel.ways);
        } else {
            throw new Error(`Street ${existingStreet.name} already exists.`);
        }
    }
}

module.exports = GeoDataService;