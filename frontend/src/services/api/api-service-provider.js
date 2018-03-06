import ApiService from "./api-service";
import axios from "axios";
import config from "../../../config/app/config";

export default function() {
    return new ApiService(axios, config.apiUrl);
}