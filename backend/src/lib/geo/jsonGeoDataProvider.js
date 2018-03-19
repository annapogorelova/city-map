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
        const fileName = `${cityName}.json`;
        const filePath = path.join(this.dataPath, fileName);

        return new Promise((resolve, reject) => {
            fs.exists(filePath, (exists) => {
                if (exists) {
                    const stream = fs.createReadStream(filePath, {encoding: "utf8"});
                    const parser = JSONStream.parse(this.formatProvider.fileFormat);
                    stream.pipe(parser).pipe(es.mapSync(function (data) {
                        resolve(data);
                    })).on("error", (error) => {
                        reject(error);
                    });
                } else {
                    reject(`${fileName} does not exist.`);
                }
            });
        });
    }
}

module.exports = JsonGeoDataProvider;