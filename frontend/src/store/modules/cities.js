"use strict";

import mutationTypes from "../mutation-types";

const citiesModule = {
    namespaced: true,
    state: {
        selectedCity: undefined,
        cities: undefined
    },
    mutations: {
        [mutationTypes.CITIES.SET_CITIES](state, cities) {
            state.cities = cities;
        },
        [mutationTypes.CITIES.SET_SELECTED_CITY](state, city) {
            state.selectedCity = city;
        }
    }
};

export default citiesModule;