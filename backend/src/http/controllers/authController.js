"use strict";

const config = require("config");
const constants = require("../../app/constants/httpConstants");

function makeAuthController(userService, jwtService) {
    return Object.freeze({
        postAuth,
        expireAuth
    });

    function _issueToken(payload, secret, expiresIn) {
        return jwtService.sign(payload, secret, {expiresIn: expiresIn});
    }

    async function postAuth(req, res) {
        try {
            const user = await userService.getByEmail(req.body.email);
            if (!user) {
                return res
                    .status(constants.statusCodes.UNAUTHORIZED)
                    .send({message: constants.messages.UNAUTHORIZED});
            }

            const isPasswordValid = await userService.isPasswordValid(req.body.password, user.password);
            if (isPasswordValid) {
                const accessToken = _issueToken(
                    {id: user.id},
                    config.security.secret,
                    config.security.expirationTimeSeconds);
                let expiresAt = new Date();
                expiresAt.setTime(expiresAt.getTime() + config.security.expirationTimeSeconds * 1000);

                return res
                    .cookie(config.security.headerName, accessToken, {
                        httpOnly: true,
                        expires: expiresAt,
                        secure: process.env.NODE_ENV === "production"
                    })
                    .send({
                        data: {
                            user: {
                                id: user.id,
                                email: user.email,
                                expiresAt: expiresAt
                            }
                        }
                    });
            } else {
                return res.status(constants.statusCodes.UNAUTHORIZED).send({
                    message: constants.messages.UNAUTHORIZED
                });
            }
        } catch (error) {
            return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR).send({
                message: constants.messages.PROBLEM_AUTHORIZING
            });
        }
    }

    async function expireAuth(req, res) {
        return res.cookie(config.security.headerName, "").send({});
    }
}

module.exports = makeAuthController;