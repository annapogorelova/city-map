"use strict";

const userService = require("../../data/services/dataServicesFactory").userService;
const jwt = require("jsonwebtoken");
const config = require("config");
const constants = require("../constants/constants");

const issueToken = function(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn: expiresIn });
};

const getAccessTokenString = function(accessToken) {
    return `Bearer ${accessToken}`;
};

module.exports = {
    async createUser(req, res) {
        try {
            const email = req.body.email;
            const user = await userService.getByEmail(email);
            if (user !== null) {
                return res
                    .status(constants.statusCodes.FORBIDDEN)
                    .send({auth: false, message: constants.messages.USER_ALREADY_EXISTS});
            }

            const createdUser = await userService.create({email: email, password: req.body.password});
            const accessToken = issueToken(
                {id: createdUser.id},
                config.security.jwt.secret,
                config.security.jwt.expirationTimeSeconds);

            return res
                .status(constants.statusCodes.OK)
                .send({auth: true, access_token: getAccessTokenString(accessToken)});
        } catch(error) {
            return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR)
                .send({ auth: false, message: constants.messages.FAILED_TO_CREATE_USER });
        }
    },

    async getAuthToken(req, res) {
        try {
            const user = await userService.getByEmail(req.body.email);
            if(user == null) {
                return res
                    .status(constants.statusCodes.UNAUTHORIZED)
                    .send({ auth: false, message: constants.messages.UNAUTHORIZED });
            }

            const isPasswordValid = await userService.isPasswordValid(req.body.password, user.password);
            if(isPasswordValid) {
                const accessToken = issueToken(
                    { id: user.id },
                    config.security.jwt.secret,
                    config.security.jwt.expirationTimeSeconds);
                return res.status(constants.statusCodes.OK).send({ auth: true, access_token: getAccessTokenString(accessToken) });
            } else {
                return res.status(constants.statusCodes.UNAUTHORIZED).send({ auth: false, message: constants.messages.UNAUTHORIZED });
            }
        } catch(error) {
            return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR).send({ auth: false, message: constants.messages.PROBLEM_AUTHORIZING });
        }
    }
};