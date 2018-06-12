import dc from "../../dependency-container";
import {optional} from "tooleks";
import constants from "../../constants";

function dataHandler(response) {
    return {
        data: response.data.data,
        count: response.data.count
    };
}

function errorHandler(error) {
    if (error && error.code === "ECONNABORTED") {
        dc.get("notices").error(constants.NOTICES.REQUEST_TIMEOUT.title, constants.NOTICES.REQUEST_TIMEOUT.message);
    } else if (optional(() => error.response.status >= 400 && error.response.status < 500)) {
        const message = optional(() => error.response.data.message,
            constants.NOTICES.REQUEST_PARAMS_ERROR.message);
        dc.get("notices").error(constants.NOTICES.REQUEST_PARAMS_ERROR.title, message);
    } else if (optional(() => error.response.status === 500)) {
        dc.get("notices").error(constants.NOTICES.SERVER_ERROR.title, constants.NOTICES.SERVER_ERROR.message);
    }

    return Promise.reject({error: optional(() => error.response.data.message)});
}

export {dataHandler, errorHandler};