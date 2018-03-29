"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeIndex("street", "street_coordinates");
        await queryInterface.removeColumn("street", "coordinates");

        await queryInterface.createTable("way", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            coordinates: {
                type: Sequelize.GEOMETRY("LINESTRING"),
                allowNull: false
            }
        });
        await queryInterface.addIndex("way", {fields: ["coordinates"], type: "SPATIAL"});

        await queryInterface.createTable("streetWay", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            streetId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            wayId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        });

        queryInterface.addConstraint("streetWay", ["streetId"], {
            type: "foreign key",
            name: "fk_streetway_street_id",
            references: {
                table: "street",
                field: "id"
            },
            onDelete: "cascade"
        });

        queryInterface.addConstraint("streetWay", ["wayId"], {
            type: "foreign key",
            name: "fk_streetway_way_id",
            references: {
                table: "way",
                field: "id"
            },
            onDelete: "cascade"
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeConstraint("streetWay", "fk_streetway_street_id");
        await queryInterface.removeConstraint("streetWay", "fk_streetway_way_id");
        await queryInterface.dropTable("streetWay");
        await queryInterface.dropTable("way");
        await queryInterface.addColumn("street", "coordinates", {
            type: Sequelize.GEOMETRY("LINESTRING"),
            allowNull: false
        });

        await queryInterface.addIndex("street", {fields: ["coordinates"], type: "SPATIAL"});
    }
};
