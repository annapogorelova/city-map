"use strict";

class GeoParser {
    constructor(geoDataProvider, geoDataFormatter) {
        this.geoDataProvider = geoDataProvider;
        this.geoDataFormatter = geoDataFormatter;
    }

    async parse(locationName) {
        const geoData = await this.geoDataProvider.getGeoData(locationName);
        return this.geoDataFormatter.formatGeoData(geoData);
    }
}

module.exports = GeoParser;