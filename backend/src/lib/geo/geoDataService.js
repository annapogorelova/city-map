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
        const streetModel = Object.assign({}, streetGeoData, optional(() => streetInfo.street, {}));
        let street = this.mapper.map(streetModel, "api.v1.street", "app.street");

        if(streetInfo.namedEntity) {
            let namedEntity = await this.processNamedEntity(streetInfo.namedEntity);
            street.namedEntityId = namedEntity.id;
        } else {
            street.namedEntityId = null;
        }

        if (!existingStreet) {
            street.cityId = city.id;
            return this.streetService.create(street, streetModel.ways);
        } else {
            // Update existing street props
            let keys = Object.getOwnPropertyNames(street).filter(k => k !== "id");
            let changed = false;

            for(let key of keys) {
                if(existingStreet.hasOwnProperty(key) &&
                    typeof street[key] !== "undefined" &&
                    existingStreet[key] !== street[key]) {
                    changed = true;
                    existingStreet[key] = street[key];
                }
            }

            if(changed) {
                return this.streetService.update(existingStreet);
            }

            return existingStreet;
        }
    }

    async processNamedEntity(namedEntityModel) {
        let namedEntity = await this.namedEntityService.getByName(namedEntityModel.name);
        if(!namedEntity) {
            return this.namedEntityService.create(namedEntityModel);
        } else {
            return namedEntity;
        }
    }
}

module.exports = GeoDataService;