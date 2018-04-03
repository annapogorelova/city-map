"use strict";
const _ = require("lodash");
const {optional} = require("tooleks");

class OverpassGeoDataFormatter {
    get fileFormat() {
        return ["elements"];
    }

    formatGeoData(geoData) {
        const ways = this.filterNamedStreets(geoData);
        const wayModels = ways.map(g => {return this.formatItem(g);});
        const wayGroups = _(wayModels).groupBy("name").sortBy("name").value();
        return wayGroups.map(streetParts => {
            return {
                name: streetParts[0].name,
                nameEn: streetParts[0].nameEn,
                oldName: streetParts[0].oldName,
                ways:  streetParts.map(g => g.coordinates)
            };
        });
    }

    formatItem(geoDataItem) {
        return {
            name: optional(() => geoDataItem["tags"]["name"] || geoDataItem["tags"]["name:en"], null),
            nameEn: optional(() => geoDataItem["tags"]["name:en"], null),
            oldName: optional(() => geoDataItem["tags"]["old_name"], null),
            coordinates: optional(() => geoDataItem["geometry"].map(g => [g["lat"], g["lon"]]), [])
        };
    }

    filterNamedStreets(geoData) {
        return geoData.filter(g => {
            return g["tags"] && (g["tags"]["name"] && g["type"] === "way" && g["tags"]["highway"]);
        });
    }
}

module.exports = OverpassGeoDataFormatter;