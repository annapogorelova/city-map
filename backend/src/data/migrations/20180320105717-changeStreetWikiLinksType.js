"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.changeColumn("street", "wikiUrl", {
            type: Sequelize.TEXT,
            allowNull: true
        });

        queryInterface.changeColumn("street", "namedAfterWikiUrl", {
            type: Sequelize.TEXT,
            allowNull: true
        });

        queryInterface.changeColumn("street", "imageUrl", {
            type: Sequelize.TEXT,
            allowNull: true
        });
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.changeColumn("street", "wikiUrl", {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        queryInterface.changeColumn("street", "namedAfterWikiUrl", {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        queryInterface.changeColumn("street", "imageUrl", {
            type: Sequelize.STRING(255),
            allowNull: true
        });
    }
};
