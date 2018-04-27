"use strict";

const config = require("config");
const constants = require("../constants/constants");

function makeAuthController(userService, jwtService) {
    return Object.freeze({
        getAuth
    });

    function _issueToken(payload, secret, expiresIn) {
        return jwtService.sign(payload, secret, { expiresIn: expiresIn });
    }

    async function getAuth(req, res) {
        try {
            const user = await userService.getByEmail(req.body.email);
            if(!user) {
                return res
                    .status(constants.statusCodes.UNAUTHORIZED)
                    .send({ auth: false, message: constants.messages.UNAUTHORIZED });
            }

            const isPasswordValid = await userService.isPasswordValid(req.body.password, user.password);
            if(isPasswordValid) {
                const accessToken = _issueToken(
                    { id: user.id },
                    config.security.secret,
                    config.security.expirationTimeSeconds);
                return res.cookie(config.security.headerName, accessToken, {httpOnly: true, secure: true}).send();
            } else {
                return res.status(constants.statusCodes.UNAUTHORIZED).send({
                    auth: false, message: constants.messages.UNAUTHORIZED
                });
            }
        } catch(error) {
            return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR).send({
                auth: false, message: constants.messages.PROBLEM_AUTHORIZING
            });
        }
    }
}

module.exports = makeAuthController;