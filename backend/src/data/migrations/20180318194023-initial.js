"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.createTable("user", {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        queryInterface.createTable("city", {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            nameEn: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            coords: {
                type: Sequelize.GEOMETRY("POINT"),
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        queryInterface.createTable("street", {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            nameEn: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            oldName: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            namedAfterDescription: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            wikiUrl: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            namedAfterWikiUrl: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            imageUrl: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        queryInterface.createTable("cityStreet", {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.dropTable("user");
        queryInterface.dropTable("city");
        queryInterface.dropTable("street");
        queryInterface.dropTable("cityStreet");
    }
};
