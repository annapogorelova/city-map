'use strict';

const userService = require('../../data/services/userService');
const mapper = require('../../helpers/mapper');
const constants = require('../constants/constants');

module.exports = {
    getUser(req, res) {
        let params = req.params;
        let id = parseInt(params.id);
        userService.getById(id).then(data => {
            if(data) {
                let model = mapper.mapUser(data);
                return res.json(model);
            }

            return next({
                status: constants.statusCodes.NOT_FOUND,
                message: constants.messages.NOT_FOUND
            });
        });
    }
};