module.exports = Object.freeze({
    statusCodes: {
        OK: 200,
        CREATED: 201,
        NOT_MODIFIED: 304,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500
    },
    messages: {
        NOT_FOUND: "Not Found.",
        UNAUTHORIZED: "Unauthorized.",
        PROBLEM_AUTHORIZING: "There was a problem authorizing the user.",
        ACCESS_TOKEN_INCORRECT_FORMAT: "Access token is not in the correct format.",
        FAILED_TO_CREATE_USER: "Failed to create the user.",
        USER_ALREADY_EXISTS: "User already exists."
    },
    regex: {
        ACCESS_TOKEN: /^(Bearer )([A-Za-z0-9\-._~+/]+=*)$/i
    },
    apiRoutes: {
        ROOT: "/api/v1",
        AUTH: "/auth",
        USERS: "/users",
        CITIES: "/cities",
        STREETS: "streets",
        NAMED_ENTITIES: "/namedEntities"
    }
});