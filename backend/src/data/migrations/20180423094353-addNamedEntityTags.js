"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("tag", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            }
        });

        await queryInterface.createTable("tagNamedEntity", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            tagId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            namedEntityId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        });

        await queryInterface.addIndex("tagNamedEntity", {
            name: "idx_tag_named_entity_named_entity_id",
            fields: ["tagId"]
        });

        await queryInterface.addIndex("tagNamedEntity", {
            name: "idx_tag_named_entity_tag_id",
            fields: ["namedEntityId"]
        });

        await queryInterface.addConstraint("tagNamedEntity", ["tagId"], {
            type: "foreign key",
            name: "fk_tag_named_entity_tag_id",
            references: {
                table: "tag",
                field: "id"
            },
            onDelete: "cascade"
        });

        await queryInterface.addConstraint("tagNamedEntity", ["namedEntityId"], {
            type: "foreign key",
            name: "fk_tag_named_entity_named_entity_id",
            references: {
                table: "namedEntity",
                field: "id"
            },
            onDelete: "cascade"
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeConstraint("tagNamedEntity", "fk_tag_named_entity_tag_id");
        await queryInterface.removeConstraint("tagNamedEntity", "fk_tag_named_entity_named_entity_id");
        await queryInterface.dropTable("tagNamedEntity");
        await queryInterface.dropTable("tag");
    }
};
