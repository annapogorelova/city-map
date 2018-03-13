"use strict";

class OverpassGeoDataFormatter {
    get fileFormat() {
        return ["elements"];
    };

    format(geoData) {
        const filteredData = this.filter(geoData);
        return filteredData.map(g => {return this.formatItem(g);});
    }

    formatItem(geoDataItem) {
        return {
            name: geoDataItem["tags"]["name"] || geoDataItem["tags"]["name:en"],
            nameEn: geoDataItem["tags"]["name:en"],
            oldName: geoDataItem["tags"]["old_name"]
        };
    }

    filter(geoData) {
        return geoData.filter(g => {return g["tags"] &&
            (!g["tags"]["noname"] && g["tags"]["name"]);});
    }
}

module.exports = OverpassGeoDataFormatter;