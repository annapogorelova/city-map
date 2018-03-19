#!/usr/bin/env node

const GeoDataService = require("../../lib/geo/geoDataService");
const GeoParser = require("../../lib/geo/geoParser");
const JsonGeoDataProvider = require("../../lib/geo/jsonGeoDataProvider");
const OverpassGeoDataFormatter = require("../../lib/geo/overpassGeoDataFormatter");
const StreetWikiService = require("../../lib/wiki/streetWikiService");
const WikiService = require("../../lib/wiki/wikiService");
const cityService = require("../../data/services/cityService");

const args = process.argv;

if(args.length < 3) {
    throw new Error("Invalid number of arguments");
}

(async () => {
    const city = await cityService.getById(parseInt(args[2]));

    if (city) {
        const geoDataFormatter = new OverpassGeoDataFormatter();
        const jsonGeoDataProvider = new JsonGeoDataProvider("./data", geoDataFormatter);
        const geoDataService = new GeoDataService(
            new GeoParser(jsonGeoDataProvider, geoDataFormatter),
            new StreetWikiService(new WikiService()));

        await geoDataService.processCity(city);
    } else {
        throw new Error("City does not exist");
    }
})();