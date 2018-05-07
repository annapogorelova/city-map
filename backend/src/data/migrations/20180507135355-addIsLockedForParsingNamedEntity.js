"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("namedEntity", "isLockedForParsing", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: (queryInterface) => {
        queryInterface.removeColumn("namedEntity", "isLockedForParsing");
    }
};
