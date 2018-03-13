"use strict";

const fs = require("fs");
const path = require("path");
const JSONStream = require("JSONStream");
const es = require('event-stream');

class JsonGeoDataProvider {
    constructor(dataPath, formatProvider) {
        this.dataPath = path.resolve(__dirname, dataPath);
        this.formatProvider = formatProvider;
    }

    async getGeoData(cityName) {
        return new Promise((resolve, reject) => {
            const fileName = `${cityName}.json`;
            const stream = fs.createReadStream(path.join(this.dataPath, fileName), {encoding: "utf8"});
            const parser = JSONStream.parse(this.formatProvider.fileFormat);
            stream.pipe(parser).pipe(es.mapSync(function (data) {
                resolve(data);
            })).on("error", (error) => {
                reject(error);
            });
        });
    }
}

module.exports = JsonGeoDataProvider;