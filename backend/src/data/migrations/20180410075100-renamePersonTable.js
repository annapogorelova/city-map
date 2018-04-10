"use strict";

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.removeConstraint("street", "fk_street_person_id");
        await queryInterface.removeIndex("street", "idx_street_person_id");
        await queryInterface.renameColumn("street", "personId", "namedEntityId");
        await queryInterface.renameTable("person", "namedEntity");
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
        })
    },

    down: async (queryInterface) => {
        await queryInterface.removeConstraint("street", "fk_street_named_entity_id");
        await queryInterface.removeIndex("street", "idx_street_named_entity_id");
        await queryInterface.renameTable("namedEntity", "person");
        await queryInterface.renameColumn("street", "namedEntityId", "personId");

        await queryInterface.addConstraint("street", ["personId"], {
            type: "foreign key",
            name: "fk_street_person_id",
            references: {
                table: "person",
                field: "id"
            },
            onDelete: "set null"
        });

        await queryInterface.addIndex("street", {
            name: "idx_street_person_id",
            fields: ["personId"]
        });
    }
};
