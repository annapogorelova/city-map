import Vue from "vue";
import App from "./app"
import router from "./router"
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

Vue.config.productionTip = false;

new Vue({
    el: '#app',
    router,
    components: {App},
    template: '<App/>'
});
