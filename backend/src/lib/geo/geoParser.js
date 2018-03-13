"use strict";
const _ = require("lodash");

class GeoParser {
    constructor(geoDataProvider, geoDataFormatter) {
        this.geoDataProvider = geoDataProvider;
        this.geoDataFormatter = geoDataFormatter;
    }
    
    async parse(locationName) {
        const geoData = await this.geoDataProvider.getGeoData(locationName);
        const normalizedData = this.normalizeGeoData(geoData);
        return _(normalizedData).uniqBy('name').sortBy('name').value();
    }

    normalizeGeoData(geoData) {
        return this.geoDataFormatter.format(geoData);
    }
}

module.exports = GeoParser;