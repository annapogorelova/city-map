"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("user", {
            id: {
                type: Sequelize.INTEGER,
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
            }
        });

        await queryInterface.createTable("city", {
            id: {
                type: Sequelize.INTEGER,
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
            coordinates: {
                type: Sequelize.GEOMETRY("POINT"),
                allowNull: false
            }
        });

        queryInterface.addIndex("city", {fields: ["coordinates"], type: "SPATIAL"});

        await queryInterface.createTable("street", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            cityId: {
                type: Sequelize.INTEGER
            },
            personId: {
                type: Sequelize.INTEGER,
                allowNull: true
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
            wikiUrl: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            coordinates: {
                type: Sequelize.GEOMETRY("LINESTRING"),
                allowNull: false
            }
        });

        queryInterface.addIndex("street", {fields: ["coordinates"], type: "SPATIAL"});

        queryInterface.addConstraint("street", ["cityId"], {
            type: "foreign key",
            name: "fk_street_city_id",
            references: {
                table: "city",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.addIndex("street", {fields: ["cityId"]});

        await queryInterface.createTable("person", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            wikiUrl: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            imageUrl: {
                type: Sequelize.TEXT,
                allowNull: true
            }
        });

        queryInterface.addConstraint("street", ["personId"], {
            type: "foreign key",
            name: "fk_street_person_id",
            references: {
                table: "person",
                field: "id"
            },
            onDelete: "set null"
        });

        await queryInterface.addIndex("street", {fields: ["personId"]});
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.dropTable("user");
        queryInterface.dropTable("street");
        queryInterface.dropTable("city");
        queryInterface.dropTable("person");
    }
};
