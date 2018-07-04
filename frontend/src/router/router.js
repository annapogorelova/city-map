import Vue from "vue";
import VueMeta from "vue-meta";
import Router from "vue-router";
import dc from "../dependency-container/index";
import routes from "./routes";

Vue.use(Router);
Vue.use(VueMeta);

let router = new Router({
    mode: "history",
    routes,
    scrollBehavior() {
        return {x: 0, y: 0};
    },
});

router.beforeEach((to, from, next) => {
    if (to.matched.some((route) => route.meta.requiresAuth) && !dc.get("auth").isAuthenticated()) {
        next({
            name: "sign-in",
            query: {redirect_uri: to.fullPath}
        });
    } else {
        next();
    }

    if(!dc.get("screenSize").isLarge()) {
        $(".navbar-collapse").collapse("hide");
    }
});

export default router;

