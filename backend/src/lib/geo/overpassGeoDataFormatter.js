"use strict";
const _ = require("lodash");

class OverpassGeoDataFormatter {
    get fileFormat() {
        return ["elements"];
    };

    formatGeoData(geoData) {
        const ways = this.filterNamedStreets(geoData);
        const nodes = this.filterNodes(geoData);
        this.assignGeoCoordinates(ways, nodes);
        const wayModels = ways.map(g => {return this.formatItem(g)});
        return _(wayModels).uniqBy("name").sortBy("name").value();
    }

    formatItem(geoDataItem) {
        return {
            name: geoDataItem["tags"]["name"] || geoDataItem["tags"]["name:en"] || null,
            nameEn: geoDataItem["tags"]["name:en"] || null,
            oldName: geoDataItem["tags"]["old_name"] || null,
            coords: geoDataItem["coords"]
        };
    }

    filterNamedStreets(geoData) {
        return geoData.filter(g => {
            return g["tags"] && (g["tags"]["name"] && g["type"] === "way");
        });
    }

    filterNodes(geoData) {
        return geoData.filter(g => {
            return g["type"] === "node";
        });
    }

    assignGeoCoordinates(ways, nodes) {
        for (let way of ways) {
            const wayCoords = (nodes && nodes.length) ? this.findPath(nodes, way.nodes) : null;
            way.coords = (wayCoords && wayCoords.length) ? wayCoords.map(c => {
                return [c.lat, c.lon]
            }) : wayCoords;
        }
    }

    findPath(nodes, wayNodes) {
        return nodes.filter(n => {
            return wayNodes.indexOf(n.id) !== -1;
        });
    }
}

module.exports = OverpassGeoDataFormatter;