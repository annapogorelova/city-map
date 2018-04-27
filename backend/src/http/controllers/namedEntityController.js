"use strict";

const config = require("config");
const constants = require("../constants/constants");

function makeNamedEntityController(namedEntityService, mapper) {
    return Object.freeze({
        search,
        update
    });

    async function search(req, res) {
        const search = req.query.search;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const {count, data} = await namedEntityService.search(search, offset, limit);
        const models = mapper.map(data, "app.namedEntity.list", "api.v1.namedEntity.list");
        return res.json({data: models, count: count});
    }

    async function update(req, res) {
        const id = parseInt(req.params.id);
        const namedEntity = req.body;

        let existingNamedEntity = await namedEntityService.getById(id);
        if(!existingNamedEntity) {
            return res
                .status(constants.statusCodes.NOT_FOUND)
                .send({ message: constants.messages.NOT_FOUND });
        }

        try {
            await namedEntityService.update(namedEntity);
            return res
                .status(constants.statusCodes.OK)
                .send({ message: "Named entity was successfully updated." });
        } catch (error) {
            return res
                .status(constants.statusCodes.INTERNAL_SERVER_ERROR)
                .send({ message: constants.messages.INTERNAL_SERVER_ERROR });
        }
    }
}

module.exports = makeNamedEntityController;