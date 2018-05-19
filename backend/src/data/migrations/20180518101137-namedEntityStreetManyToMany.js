"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("streetNamedEntity", {
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
            namedEntityId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        });

        await queryInterface.addIndex("streetNamedEntity", {
            name: "idx_street_named_entity_street_id",
            fields: ["streetId"]
        });

        await queryInterface.addIndex("streetNamedEntity", {
            name: "idx_street_named_entity_named_entity_id",
            fields: ["namedEntityId"]
        });

        await queryInterface.addConstraint("streetNamedEntity", ["streetId"], {
            type: "foreign key",
            name: "fk_street_named_entity_street_id",
            references: {
                table: "street",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.addConstraint("streetNamedEntity", ["namedEntityId"], {
            type: "foreign key",
            name: "fk_street_named_entity_named_entity_id",
            references: {
                table: "namedEntity",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.sequelize.query(
            `INSERT INTO streetNamedEntity (streetId, namedEntityId) 
            SELECT id, namedEntityId FROM street where namedEntityId IS NOT NULL;`);

        await queryInterface.removeColumn("street", "namedEntityId");
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("street", "namedEntityId", {
            type: Sequelize.INTEGER,
            allowNull: true,
        });

        await queryInterface.addConstraint("street", ["namedEntityId"], {
            type: "foreign key",
            name: "fk_street_named_entity_id",
            references: {
                table: "namedEntity",
                field: "id"
            },
            onDelete: "set null"
        });

        await queryInterface.addIndex("street", {
            name: "idx_street_named_entity_id",
            fields: ["namedEntityId"]
        });

        await queryInterface.sequelize.query(`
            UPDATE street INNER JOIN streetNamedEntity on street.id = streetNamedEntity.streetId
            SET street.namedEntityId = streetNamedEntity.namedEntityId`);

        await queryInterface.removeConstraint("streetNamedEntity", "fk_street_named_entity_street_id");
        await queryInterface.removeConstraint("streetNamedEntity", "fk_street_named_entity_named_entity_id");
        await queryInterface.dropTable("streetNamedEntity");
    }
};
