#!/usr/bin/env node

const dc = require("../../app/dependencyResolver");
const cityService = dc.get("CityService");
const geoDataService = dc.get("GeoDataService");

const args = process.argv;

if(args.length < 3) {
    throw new Error("Invalid number of arguments");
}

(async () => {
    const city = await cityService.getByNameEn(args[2]);

    if (city) {
        await geoDataService.processCity(city);
    } else {
        throw new Error("City does not exist");
    }

    console.log(`Finished processing ${city.nameEn}.`);
})();