"use strict";

const db = require("../models/index");

module.exports = {
    up: async () => {
        const existingCity = await db.city.findOne();

        const streets = [
            {
                cityId: existingCity.id,
                name: "Шевченка вулиця",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }, {
                cityId: existingCity.id,
                name: "Франка вулиця",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }, {
                cityId: existingCity.id,
                name: "Лесі Українки вулиця",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }, {
                cityId: existingCity.id,
                name: "Коцюбинського вулиця",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }, {
                cityId: existingCity.id,
                name: "Олени Пчілки вулиця",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }, {
                cityId: existingCity.id,
                name: "Симоненка вулиця",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        ];

        for(let street of streets) {
            let existingStreet = await db.street.findOne({where: {name: street.name}});
            if(!existingStreet) {
                await db.street.create(street);
            }
        }
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete("street", null, {});
    }
};
