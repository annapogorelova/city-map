"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("way", "streetId", {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.sequelize.query(`
                UPDATE way INNER JOIN streetWay on streetWay.wayId = way.id
                SET way.streetId = streetWay.streetId`);

        await queryInterface.changeColumn("way", "streetId", {
            type: Sequelize.INTEGER,
            allowNull: false
        });

        await queryInterface.addIndex("way", {
            name: "idx_way_street_id",
            fields: ["streetId"]
        });

        await queryInterface.addConstraint("way", ["streetId"], {
            type: "foreign key",
            name: "fk_way_street_id",
            references: {
                table: "street",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.removeConstraint("streetWay", "fk_streetway_street_id");
        await queryInterface.removeConstraint("streetWay", "fk_streetway_way_id");
        await queryInterface.dropTable("streetWay");
    },

    down: async (queryInterface, Sequelize) => {
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

        await queryInterface.addIndex("streetWay", {
            name: "idx_street_way_street_id",
            fields: ["streetId"]
        });

        await queryInterface.addIndex("streetWay", {
            name: "idx_street_way_way_id",
            fields: ["wayId"]
        });

        await queryInterface.addConstraint("streetWay", ["streetId"], {
            type: "foreign key",
            name: "fk_streetway_street_id",
            references: {
                table: "street",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.addConstraint("streetWay", ["wayId"], {
            type: "foreign key",
            name: "fk_streetway_way_id",
            references: {
                table: "way",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.query("INSERT INTO streetWay (streetId, wayId) SELECT streetId, id FROM way;");

        await queryInterface.removeConstraint("way", "fk_way_street_id");
        await queryInterface.removeIndex("way", "idx_way_street_id");
        await queryInterface.removeColumn("way", "streetId");
    }
};
