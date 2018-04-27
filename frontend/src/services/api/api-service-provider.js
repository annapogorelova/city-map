import ApiService from "./api-service";
import axios from "axios";

function dataHandler(response) {
    return {data: response.data.data, count: response.data.count};
}

function errorHandler(response) {
    return response.data;
}

export default function() {
    return new ApiService(axios, process.env.API_URL, dataHandler, errorHandler);
}