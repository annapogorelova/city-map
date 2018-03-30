import StreetService from "./street-service";
import ApiService from "../api/index";

export default function() {
    return new StreetService(ApiService);
}