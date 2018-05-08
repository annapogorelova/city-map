"use strict";

const config = require("config");
const httpConstants = require("../../app/constants/httpConstants");
const {optional} = require("tooleks");

function makeAuthMiddleware(userService, jwtService) {
    return Object.freeze({
        verifyAuth,
        extractAuth
    });

    function extractAuth(req, res, next) {
        const accessToken = req.cookies[config.security.headerName];
        if (!accessToken) {
            return next();
        }

        jwtService.verify(accessToken, config.security.secret, async (error, decoded) => {
            if (error || !decoded.id) {
                return res
                    .status(httpConstants.statusCodes.UNAUTHORIZED)
                    .send({message: httpConstants.messages.UNAUTHORIZED});
            }

            const user = await userService.getById(decoded.id)
                .then(user => optional(() => user.get({plain: true})));

            if (!user) {
                return res
                    .status(httpConstants.statusCodes.UNAUTHORIZED)
                    .send({message: httpConstants.messages.UNAUTHORIZED});
            }

            req.userId = decoded.id;
            req.user = user;

            next();
        });
    }

    function verifyAuth(req, res, next) {
        if (!req.user) {
            return res.status(httpConstants.statusCodes.UNAUTHORIZED)
                .send({message: httpConstants.messages.UNAUTHORIZED});
        }

        next();
    }
}

module.exports = makeAuthMiddleware;