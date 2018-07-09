"use strict";

/**
 * Make users controller
 * @param userService
 * @param mapper
 * @returns {Readonly<{getUser: getUser}>}
 */
function makeUsersController(userService, mapper) {
    return Object.freeze({
        getUser
    });

    /**
     * Get user by id
     * @param req
     * @param res
     * @param next
     * @returns {Promise<*>}
     */
    async function getUser(req, res, next) {
        let params = req.params;
        let id = parseInt(params.id);
        const user = await userService.getById(id);
        if (user) {
            let model = mapper.map(user, "app.user", "api.v1.user");
            return res.json(model);
        }

        return next();
    }
}

module.exports = makeUsersController;