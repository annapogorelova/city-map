import {DependencyContainer, EventEmitter} from "tooleks";
import {ApiService} from "../services/api";
import {LocalStorageService} from "../services/local-storage";
import {AuthService} from "../services/auth";
import {StreetService} from "../services/streets";
import {CityService} from "../services/cities";
import {NamedEntityService} from "../services/named-entities";
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
    (response) => {
        return Promise.reject({error: response.message});
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

dc.registerBinding("streets", StreetService, {
    dependencies: ["api"]
});

dc.registerBinding("cities", CityService, {
    dependencies: ["api"]
});

dc.registerBinding("namedEntities", NamedEntityService, {
    dependencies: ["api"]
});

export default dc;
