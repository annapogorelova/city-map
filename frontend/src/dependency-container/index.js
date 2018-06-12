import {DependencyContainer, EventEmitter} from "tooleks";
import {ApiService, dataHandler, errorHandler} from "../services/api";
import {LocalStorageService} from "../services/local-storage";
import {AuthService} from "../services/auth";
import {StreetsService} from "../services/streets";
import {CitiesService} from "../services/cities";
import {NamedEntitiesService} from "../services/named-entities";
import {NoticesService} from "../services/notices";
import {ScreenSizeService} from "../services/screen";
import axios from "axios";
import appConfig from "../app.config";

const dc = new DependencyContainer;

dc.registerInstance("dc", dc);

const eventBus = new EventEmitter();
dc.registerInstance("eventBus", eventBus);

dc.registerBinding("api", () => new ApiService(
    axios,
    appConfig.apiUrl,
    appConfig.requestTimeout,
    dataHandler,
    errorHandler),
{
    singleton: true,
    factory: true
});

dc.registerBinding("localStorage", () => new LocalStorageService(localStorage));

dc.registerInstance("screenSize", new ScreenSizeService());

dc.registerBinding("notices", () => new NoticesService(new EventEmitter), { singleton: true, factory: true});

dc.registerBinding("auth",
    (apiService, localStorageService) =>
        new AuthService(apiService, localStorageService, new EventEmitter, eventBus, "user"), {
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
