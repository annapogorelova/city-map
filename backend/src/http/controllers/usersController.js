"use strict";

const userService = require("../../data/services/userService");
const mapper = require("../../helpers/mapper");

module.exports = {
    async getUser(req, res) {
        let params = req.params;
        let id = parseInt(params.id);
        const user = await userService.getById(id);
        if (user) {
            let model = mapper.mapUser(user);
            return res.json(model);
        }

        return next();
    }
};