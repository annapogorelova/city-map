import "leaflet/dist/leaflet.js";
import "leaflet/dist/leaflet.css";
import "../../assets/js/leaflet-providers";
import { OpenStreetMapProvider } from "leaflet-geosearch";

export default class MapService {
    constructor() {
        this.geoDataProvider = new OpenStreetMapProvider();
    };

    async createMap(elementId, zoom, layerName) {
        const coordinates = await this.getCurrentPosition();
        const position = [coordinates.coords.latitude, coordinates.coords.longitude];
        const map = L.map(elementId).setView(position, zoom);
        L.tileLayer.provider(layerName).addTo(map);
        return map;
    };

    search(searchPhrase) {
        return this.geoDataProvider.search({ query: searchPhrase });
    };
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    resolve(position);
                });
            } else {
                reject('Geolocation is not supported by this browser.');
            }
        });
    }
}