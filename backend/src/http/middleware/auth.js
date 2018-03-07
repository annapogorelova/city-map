'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const constants = require('../constants/constants');

module.exports = {
    verifyToken: function(req, res, next) {
        const accessToken = req.headers[config.security.jwt.headerName];
        if (!accessToken) {
            return res.status(constants.statusCodes.UNAUTHORIZED)
                .send({ auth: false, message: constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT });
        }
        
        const match = constants.regex.ACCESS_TOKEN.exec(accessToken);
        if(!match || match.length < 3) {
            return res.status(constants.statusCodes.BAD_REQUEST)
                .send({auth: false, message: constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT});
        }

        const accessTokenString = match[2];
        jwt.verify(accessTokenString, config.security.jwt.secret, function(err, decoded) {
            if (err) {
                return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR)
                    .send({ auth: false, message: constants.messages.UNAUTHORIZED });
            }

            req.userId = decoded.id;
            next();
        });
    }
};