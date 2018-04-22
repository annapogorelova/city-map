"use strict";

const {optional} = require("tooleks");
const constants = require("constants");

class GeoDataService {
    constructor(geoParser, wikiService, streetService, namedEntityService, mapper) {
        this.geoParser = geoParser;
        this.wikiService = wikiService;
        this.streetService = streetService;
        this.namedEntityService = namedEntityService;
        this.mapper = mapper;
    }

    async processCity(city, skipExisting = false) {
        try {
            const streetsGeoData = await this.geoParser.parse(city.nameEn);
            for (let geoData of streetsGeoData) {
                try {
                    const street = await this.processStreet(geoData, city, skipExisting);
                    console.log(`Processed ${street.name}.`);
                } catch(err) {
                    console.log(err.message);
                }
            }
        } catch (err) {
            throw Error(err);
        }
    }

    async processStreet(streetGeoData, city, skipExisting) {
        let existingStreet = await this.streetService.getByName(streetGeoData.name, city.id);
        if(existingStreet && skipExisting) {
            return existingStreet;
        }

        const streetInfo = await this.wikiService.getStreetInfo(streetGeoData.name, city.name);
        const streetModel = Object.assign({}, streetGeoData, optional(() => streetInfo, {}));
        let street = this.mapper.map(streetModel, "api.v1.street", "app.street");

        const namedEntity = await this.processNamedEntity(streetGeoData.name,
            optional(() => streetInfo.info[constants.namedAfterInfoBoxProperty]));

        if(namedEntity) {
            street.namedEntityId = namedEntity.id;
        }

        street.cityId = city.id;
        return this.streetService.create(street, streetModel.ways);
    }

    async processNamedEntity(streetName, namedAfter) {
        const sameNameStreet = await this.streetService.getBySimilarName(streetName);
        if(optional(() => sameNameStreet.namedEntityId)) {
            return sameNameStreet;
        } else {
            let namedEntityModel = await this.wikiService.getNamedEntityInfo(streetName, namedAfter);
            if(namedEntityModel) {
                let namedEntity = await this.namedEntityService.getByName(namedEntityModel.name);
                if(!namedEntity) {
                    namedEntity = await this.namedEntityService.create(namedEntityModel);
                }
                return namedEntity;
            }
        }
    }
}

module.exports = GeoDataService;