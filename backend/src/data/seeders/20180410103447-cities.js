"use strict";

const db = require("../models/index");

module.exports = {
    up: async () => {
        const cities = [{
            name: "Львів",
            nameEn: "Lviv",
            coordinates: [49.8327786, 23.9420238],
            bounds: [[[49.76783, 23.857346], [49.76783, 24.162016], [49.928009, 24.162016],[49.928009, 23.857346], [49.76783, 23.857346]]]
        }, {
            name: "Володимир-Волинський",
            nameEn: "Volodymyr-Volynskyi",
            coordinates: [50.8482214, 24.2869926],
            bounds: [[[50.816284, 24.264795], [50.816284, 24.384825], [50.87785, 24.384825], [50.87785, 24.264795], [50.816284, 24.264795]]]
        }, {
            name: "Луцьк",
            nameEn: "Lutsk",
            coordinates: [50.7465708, 25.2818164],
            bounds: [[[50.688999, 25.261957], [50.688999, 25.405102],[50.788925, 25.405102], [50.788925, 25.261957], [50.688999, 25.261957]]]
        }, {
            name: "Івано-Франківськ",
            nameEn: "Ivano-Frankivsk",
            coordinates: [48.9118646, 24.6469172],
            bounds: [[[48.861492, 24.642426], [48.861492, 24.758966], [48.956757, 24.758966],[48.956757, 24.642426], [48.861492, 24.642426]]]
        }];

        for(let city of cities) {
            let existingCity = await db.city.findOne({where: {name: city.name}});
            if(!existingCity) {
                await db.city.create(city);
            }
        }
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete("city", null, {});
    }
};
