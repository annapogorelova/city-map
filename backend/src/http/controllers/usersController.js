"use strict";

const userService = require("../../data/services/dataServicesFactory").userService;
const mapper = require("../../helpers/mapper");

module.exports = {
    async getUser(req, res) {
        let params = req.params;
        let id = parseInt(params.id);
        const user = await userService.getById(id);
        if (user) {
            let model = mapper.map(user, "app.user", "api.v1.user");
            return res.json(model);
        }

        return next();
    }
};