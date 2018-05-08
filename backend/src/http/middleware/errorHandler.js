"use strict";

const {optional} = require("tooleks");
const {errors, httpConstants} = require("../../app/constants/index");

module.exports = {
    handleError(error, req, res, next) {
        const errorInfo = errors[error.message];
        res.status(optional(() => errorInfo.status, httpConstants.statusCodes.INTERNAL_SERVER_ERROR))
            .send({message: optional(() => errorInfo.message, errors.defaultErrorMessage)});
    }
};