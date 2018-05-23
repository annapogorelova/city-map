import {optional, DependencyContainer, EventEmitter} from "tooleks";
import {ApiService} from "../services/api";
import {LocalStorageService} from "../services/local-storage";
import {AuthService} from "../services/auth";
import {StreetsService} from "../services/streets";
import {CitiesService} from "../services/cities";
import {NamedEntitiesService} from "../services/named-entities";
import {NoticesService} from "../services/notices";
import axios from "axios";
import AppConfig from "../app.config";
import constants from "../constants";

const dc = new DependencyContainer;

dc.registerInstance("dc", dc);

dc.registerInstance("eventBus", new EventEmitter());

dc.registerBinding("api", () => new ApiService(
    axios,
    AppConfig.apiUrl,
    AppConfig.requestTimeout,
    (response) => {
        return Promise.resolve({
            data: response.data.data,
            count: response.data.count
        });
    },
    (error) => {
        if(error && error.code === "ECONNABORTED") {
            dc.get("notices").error(constants.NOTICES.REQUEST_TIMEOUT.title, constants.NOTICES.REQUEST_TIMEOUT.message);
        } else if(optional(() => error.response.status >= 400 && error.response.status < 500)) {
            const message = optional(() => error.response.data.message,
                constants.NOTICES.REQUEST_PARAMS_ERROR.message);
            dc.get("notices").error(constants.NOTICES.REQUEST_PARAMS_ERROR.title, message);
        } else if(optional(() => error.response.status >= 500)) {
            dc.get("notices").error(constants.NOTICES.SERVER_ERROR.title, constants.NOTICES.SERVER_ERROR.message);
        }

        return Promise.reject({error: error.message});
    }),
{
    singleton: true,
    factory: true
});

dc.registerBinding("localStorage", () => new LocalStorageService(localStorage));

dc.registerBinding("notices", () => new NoticesService(new EventEmitter), { singleton: true, factory: true});

dc.registerBinding("auth",
    (apiService, localStorageService) =>
        new AuthService(apiService, localStorageService, new EventEmitter, "user"), {
        dependencies: ["api", "localStorage"],
        singleton: true,
        factory: true,
    });

dc.registerBinding("streets", StreetsService, {
    dependencies: ["api"]
});

dc.registerBinding("cities", CitiesService, {
    dependencies: ["api"]
});

dc.registerBinding("namedEntities", NamedEntitiesService, {
    dependencies: ["api"]
});

export default dc;
