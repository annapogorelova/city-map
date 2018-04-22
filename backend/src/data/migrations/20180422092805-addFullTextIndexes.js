"use strict";

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex("street", {
            fields: ["name"],
            name: "idx_street_name",
            type: "FULLTEXT"
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex("street", "idx_street_name");
    }
};
