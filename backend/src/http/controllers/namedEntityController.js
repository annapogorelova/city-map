"use strict";

const config = require("config");

function makeNamedEntityController(namedEntityService, mapper) {
    return Object.freeze({
        search
    });

    async function search(req, res) {
        const search = req.query.search;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const {count, data} = await namedEntityService.search(search, offset, limit);
        const models = mapper.map(data, "app.namedEntity.list", "api.v1.namedEntity.list");
        return res.json({data: models, count: count});
    }
}

module.exports = makeNamedEntityController;