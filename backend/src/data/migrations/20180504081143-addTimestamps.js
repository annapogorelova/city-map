"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("namedEntity", "createdAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        });

        await queryInterface.addColumn("namedEntity", "updatedAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        });

        await queryInterface.addColumn("street", "createdAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        });

        await queryInterface.addColumn("street", "updatedAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        });

        await queryInterface.sequelize.query("UPDATE namedEntity SET createdAt = NOW();");
        await queryInterface.sequelize.query("UPDATE namedEntity SET updatedAt = NOW();");
        await queryInterface.sequelize.query("UPDATE street SET createdAt = NOW();");
        await queryInterface.sequelize.query("UPDATE street SET updatedAt = NOW();");

        await queryInterface.changeColumn("namedEntity", "createdAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        });

        await queryInterface.changeColumn("namedEntity", "updatedAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        });

        await queryInterface.changeColumn("street", "createdAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        });

        await queryInterface.changeColumn("street", "updatedAt", {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            allowNull: false
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn("namedEntity", "createdAt");
        await queryInterface.removeColumn("namedEntity", "updatedAt");
        await queryInterface.removeColumn("street", "createdAt");
        await queryInterface.removeColumn("street", "updatedAt");
    }
};
