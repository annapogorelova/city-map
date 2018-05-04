"use strict";

const statusCodes = require("./statusCodes");

module.exports = {
    NOT_FOUND: {
        key: "NOT_FOUND",
        status: statusCodes.NOT_FOUND,
        message: "Entity not found"
    },
    ALREADY_EXISTS: {
        key: "ALREADY_EXISTS",
        status: statusCodes.BAD_REQUEST,
        message: "Entity already exists"
    },
    defaultErrorMessage: "Something went wrong"
};