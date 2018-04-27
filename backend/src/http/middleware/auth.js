"use strict";

const jwt = require("jsonwebtoken");
const config = require("config");
const constants = require("../constants/constants");
const {optional} = require("tooleks");

function makeAuthMiddleware(userService) {
    return Object.freeze({
        verifyAuth,
        extractAuth
    });

    function extractAuth(req, res, next) {
        const accessToken = req.headers[config.security.jwt.headerName];
        if (!accessToken) {
            return next();
        }

        const match = constants.regex.ACCESS_TOKEN.exec(accessToken);
        const accessTokenString = optional(() => match[2]);
        if (!accessTokenString) {
            return res.status(constants.statusCodes.BAD_REQUEST)
                .send({auth: false, message: constants.messages.ACCESS_TOKEN_INCORRECT_FORMAT});
        }

        jwt.verify(accessTokenString, config.security.jwt.secret, async function (error, decoded) {
            if (error || !decoded.id) {
                return res
                    .status(constants.statusCodes.INTERNAL_SERVER_ERROR)
                    .send({auth: false, message: constants.messages.UNAUTHORIZED});
            }

            const user = await userService.getById(decoded.id)
                .then(user => optional(() => user.get({plain: true})));

            if (!user) {
                return res
                    .status(constants.statusCodes.UNAUTHORIZED)
                    .send({auth: false, message: constants.messages.UNAUTHORIZED});
            }

            req.userId = decoded.id;
            req.user = user;

            next();
        });
    }

    function verifyAuth(req, res, next) {
        if(!req.user) {
            return res.status(constants.statusCodes.UNAUTHORIZED)
                .send({auth: false, message: constants.messages.UNAUTHORIZED});
        }

        next();
    }
}

module.exports = makeAuthMiddleware;