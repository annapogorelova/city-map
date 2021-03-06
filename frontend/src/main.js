import "./polyfills";

import Vue from "vue";
import App from "./app";
import router from "./router/router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "../assets/css/fontawesome-all.min.css";
import "../assets/css/tables.css";
import dc from "./dependency-container";
import "./filters/index";
import "./directives/index";
import store from "./store";

Vue.config.productionTip = false;
Vue.prototype.$dc = dc;


new Vue({
    el: "#app",
    router,
    store,
    components: {App},
    template: "<App/>"
});
