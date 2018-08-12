import Vue from "vue";
import VueMeta from "vue-meta";
import Router from "vue-router";
import dc from "../dependency-container/index";
import routes from "./routes";
import store from "../store/index";
import {optional} from "tooleks";

Vue.use(Router);
Vue.use(VueMeta);

const router = new Router({
    mode: "history",
    routes,
    scrollBehavior() {
        return {x: 0, y: 0};
    },
});

router.beforeEach((to, from, next) => {
    if (to.matched.some((route) => route.meta.requiresAuth) &&
        !dc.get("auth").isAuthenticated()) {
        next({
            name: "not-found"
        });
    } else {
        next();
    }

    if(!dc.get("screen").isLarge()) {
        $(".navbar-collapse").collapse("hide");
    }

    if(to.meta.dependsOnCity && !to.query.cityId) {
        next({name: to.name, query: {cityId: optional(() => store.state.cities.selectedCity.id)}});
    }
});

export default router;

