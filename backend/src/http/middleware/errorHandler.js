"use strict";

const {optional} = require("tooleks");
const {errors, statusCodes} = require("../../app/constants/index");

module.exports = {
    handleError(error, req, res, next) {
        const errorInfo = errors[error.message];
        res.status(optional(() => errorInfo.status, statusCodes.INTERNAL_SERVER_ERROR))
            .send({message: optional(() => errorInfo.message, errors.defaultErrorMessage)});
    }
};