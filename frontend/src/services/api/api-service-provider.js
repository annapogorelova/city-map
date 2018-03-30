import ApiService from "./api-service";
import axios from "axios";

function dataHandler(response) {
    return response.data.data;
}

function errorHandler(response) {
    return response.data;
}

export default function() {
    return new ApiService(axios, process.env.API_URL, dataHandler, errorHandler);
}