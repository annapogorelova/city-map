"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("city", "isPublished", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn("city", "isPublished");
    }
};
