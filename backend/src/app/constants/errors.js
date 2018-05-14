"use strict";

const statusCodes = require("./httpConstants").statusCodes;

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
    BAD_REQUEST: {
        key: "BAD_REQUEST",
        status: statusCodes.BAD_REQUEST,
        message: "Invalid parameters"
    },
    defaultErrorMessage: "Something went wrong"
};