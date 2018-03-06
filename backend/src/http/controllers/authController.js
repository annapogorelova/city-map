'use strict';

const userService = require('../../data/services/userService');
const jwt = require('jsonwebtoken');
const config = require('config');
const constants = require('../constants/constants');

const issueToken = function(payload, secret, expiresIn) {
    return jwt.sign(payload, secret, { expiresIn: expiresIn });
};

const getAccessTokenString = function(accessToken) {
    return `Bearer ${accessToken}`;
};

module.exports = {
    createUser(req, res) {
        const email = req.body.email;
        userService.getByEmail(email).then(user => {
            if(user !== null) {
                return res.status(constants.statusCodes.FORBIDDEN)
                    .send({ auth: false, message: constants.messages.USER_ALREADY_EXISTS });
            }

            userService.create(email, req.body.password).then(newUser => {
                const accessToken = issueToken(
                    { id: newUser.id }, 
                    config.security.jwt.secret, 
                    config.security.jwt.expirationTimeSeconds);
                return res.status(constants.statusCodes.OK).send({
                    auth: true, access_token: getAccessTokenString(accessToken)
                });
            }).catch(error => {
                return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR)
                    .send({ auth: false, message: constants.messages.FAILED_TO_CREATE_USER });
            });
        });       
    },

    getAuthToken(req, res) {
        userService.getByEmail(req.body.email).then(user => {
            if(user == null) {
                return res.status(constants.statusCodes.UNAUTHORIZED).send({ auth: false, message: constants.messages.UNAUTHORIZED });
            }

            userService.isPasswordValid(req.body.password, user.password).then(isEqual => {
                if(isEqual) {
                    const accessToken = issueToken(
                        { id: user.id }, 
                        config.security.jwt.secret, 
                        config.security.jwt.expirationTimeSeconds);
                    return res.status(constants.statusCodes.OK).send({ auth: true, access_token: getAccessTokenString(accessToken) });
                } else {
                    return res.status(constants.statusCodes.UNAUTHORIZED).send({ auth: false, message: constants.messages.UNAUTHORIZED });
                }
            });
        }).catch(err => {
            return res.status(constants.statusCodes.INTERNAL_SERVER_ERROR).send({ auth: false, message: constants.messages.PROBLEM_AUTHORIZING });
        });
    }
};