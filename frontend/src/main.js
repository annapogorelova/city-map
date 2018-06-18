import "./polyfills";

import Vue from "vue";
import VueAnalytics from "vue-analytics";
import App from "./app";
import router from "./router/router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "../assets/css/fontawesome-all.min.css";
import "../assets/css/tables.css";
import dc from "./dependency-container";
import "./filters/index";
import appConfig from "./app.config";

Vue.config.productionTip = false;
Vue.prototype.$dc = dc;

if (appConfig.googleAnalyticsId) {
    Vue.use(VueAnalytics, {
        id: appConfig.googleAnalyticsId,
        checkDuplicatedScript: true,
        router,
        debug: {
            sendHitTask: process.env.NODE_ENV === "production"
        }
    });
}

new Vue({
    el: "#app",
    router,
    components: {App},
    template: "<App/>"
});
