"use strict";

const config = require("config");
const httpConstants = require("../../app/constants/httpConstants");

/**
 * Makes named entity controller
 * @param namedEntityService
 * @param mapper
 * @returns {Readonly<{search: (function(*, *): *), create: create, update: update, remove: remove}>}
 */
function makeNamedEntityController(namedEntityService, mapper) {
    return Object.freeze({
        search,
        create,
        update,
        remove
    });

    /**
     * Search named entities with pagination
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async function search(req, res) {
        const search = req.query.search;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || config.defaults.pageLimit;
        const {count, data} = await namedEntityService.search({
            search: search,
            offset: offset,
            limit: limit
        });
        const models = await mapper.map(data, "app.namedEntity.list", "api.v1.namedEntity.list");
        return res.json({data: models, count: count});
    }

    /**
     * Create named entity
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async function create(req, res, next) {
        const namedEntity = req.body;

        try {
            await namedEntityService.create(namedEntity);
            return res
                .status(httpConstants.statusCodes.OK)
                .send({ message: "Named entity was successfully created." });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update a named entity
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async function update(req, res, next) {
        const id = parseInt(req.params.id);
        const namedEntity = req.body;

        try {
            await namedEntityService.update(id, namedEntity);
            return res
                .status(httpConstants.statusCodes.OK)
                .send({ message: "Named entity was successfully updated." });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove a named entity
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async function remove(req, res, next) {
        const id = parseInt(req.params.id);

        try {
            await namedEntityService.remove(id);
            return res
                .status(httpConstants.statusCodes.NO_CONTENT)
                .send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = makeNamedEntityController;