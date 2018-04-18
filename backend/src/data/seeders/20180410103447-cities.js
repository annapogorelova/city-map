"use strict";

const db = require("../models/index");

module.exports = {
    up: async () => {
        const cities = [{
            name: "Львів",
            nameEn: "Lviv",
            coordinates: [49.8327786, 23.9420238]
        }, {
            name: "Володимир-Волинський",
            nameEn: "Volodymyr-Volynskyi",
            coordinates: [50.8482214, 24.2869926]
        }, {
            name: "Жовква",
            nameEn: "Zhovkva",
            coordinates: [50.0549683, 23.94149476]
        }, {
            name: "Луцьк",
            nameEn: "Lutsk",
            coordinates: [50.7465708, 25.2818164]
        }, {
            name: "Івано-Франківськ",
            nameEn: "Ivano-Frankivsk",
            coordinates: [48.9118646, 24.6469172]
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
