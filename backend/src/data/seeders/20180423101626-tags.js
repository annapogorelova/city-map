"use strict";

const db = require("../models/index");

module.exports = {
    up: async () => {
        const tags = [
            {name: "письменники"},
            {name: "поети"},
            {name: "композитори"},
            {name: "музиканти"},
            {name: "художники"},
            {name: "історики"},
            {name: "етнографи"},
            {name: "археологи"},
            {name: "краєзнавці"},
            {name: "науковці"},
            {name: "винахідники"},
            {name: "селекціонери"},
            {name: "педіатри"},
            {name: "біологи"},
            {name: "зоологи"},
            {name: "орнітологи"},
            {name: "іконописці"},
            {name: "релігійні діячі"},
            {name: "священики"},
            {name: "теологи"},
            {name: "педагоги"},
            {name: "філологи"},
            {name: "князі"},
            {name: "військовики"},
            {name: "рюриковичі"},
            {name: "телережисери"},
        ];

        for(let tag of tags) {
            let existingTag = await db.tag.findOne({where: {name: tag.name}});
            if(!existingTag) {
                await db.tag.create(tag);
            }
        }
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete("tag", null, {});
    }
};
