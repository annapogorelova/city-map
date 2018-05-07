import {DependencyContainer, EventEmitter} from "tooleks";
import {ApiService} from "../services/api";
import {LocalStorageService} from "../services/local-storage";
import {AuthService} from "../services/auth";
import {StreetsService} from "../services/streets";
import {CitiesService} from "../services/cities";
import {NamedEntitiesService} from "../services/named-entities";
import {NoticesService} from "../services/notices";
import axios from "axios";

const dc = new DependencyContainer;

dc.registerInstance("dc", dc);

dc.registerBinding("api", () => new ApiService(
    axios,
    process.env.API_URL,
    (response) => {
        return Promise.resolve({
            data: response.data.data,
            count: response.data.count
        });
    },
    (error) => {
        if(error && error.code === "ECONNABORTED") {
            dc.get("notices").error("Час запиту вийшов", "Спробуйте будь ласка пізніше");
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
