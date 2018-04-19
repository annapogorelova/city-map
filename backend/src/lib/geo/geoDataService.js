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
                    const street = await this.processStreet(geoData, city);
                    console.log(`Processed ${street.name}.`);
                } catch(err) {
                    console.log(err.message);
                }
            }
        } catch (err) {
            throw Error(err);
        }
    }

    async processStreet(streetGeoData, city) {
        let existingStreet = await this.streetService.getByName(streetGeoData.name, city.id);
        if(existingStreet) {
            return existingStreet;
        }

        const streetInfo = await this.wikiService.getStreetInfo(streetGeoData.name, city.name);
        const streetModel = Object.assign({}, streetGeoData, optional(() => streetInfo, {}));
        let street = this.mapper.map(streetModel, "api.v1.street", "app.street");

        const sameNameStreet = await this.streetService.getByName(streetGeoData.name);
        if(optional(() => sameNameStreet.namedEntityId)) {
            street.namedEntityId = sameNameStreet.namedEntityId;
        } else {
            let namedEntityModel = await this.wikiService.getNamedEntityInfo(streetGeoData.name, optional(() => streetInfo.info["назва на честь"]));
            if(namedEntityModel) {
                let namedEntity = await this.namedEntityService.getByName(namedEntityModel.name);
                if(!namedEntity) {
                    namedEntity = await this.namedEntityService.create(namedEntityModel);
                }
                street.namedEntityId = namedEntity.id;
            }
        }

        street.cityId = city.id;
        return this.streetService.create(street, streetModel.ways);
    }
}

module.exports = GeoDataService;