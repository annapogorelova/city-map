import Vue from "vue";
import Vuex from "vuex";
import cities from "./modules/cities";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
    modules: {
        cities
    },
    strict: debug
});