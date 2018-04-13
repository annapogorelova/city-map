"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert("city", [{
            name: "Львів",
            nameEn: "Lviv",
            coordinates: Sequelize.fn("ST_GeomFromText", "POINT(49.8327786 23.9420238)", "4326"),
        }, {
            name: "Володимир-Волинський",
            nameEn: "Volodymyr-Volynskyi",
            coordinates: Sequelize.fn("ST_GeomFromText", "POINT(50.8482214 24.2869926)", "4326")
        }, {
            name: "Жовква",
            nameEn: "Zhovkva",
            coordinates: Sequelize.fn("ST_GeomFromText", "POINT(50.0549683 23.94149476)", "4326")
        }], {});
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete("city", null, {});
    }
};
