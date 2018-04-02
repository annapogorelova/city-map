import CityService from "./city-service";
import ApiService from "../api/index";

export default function() {
    return new CityService(ApiService);
}