"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn("street", "coords", {
            type: Sequelize.GEOMETRY("LINESTRING"),
            allowNull: true
        });
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.removeColumn("street", "coords");
    }
};
