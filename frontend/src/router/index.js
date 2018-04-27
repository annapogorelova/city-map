import Vue from "vue";
import Router from "vue-router";
import SignIn from "../components/auth/sign-in";
import CityMap from "../components/city-map/city-map";
import StreetsList from "../components/admin/streets-list";
import NamedEntitiesList from "../components/admin/named-entities-list";

Vue.use(Router);

export default new Router({
    mode: "history",
    routes: [
        {
            path: "/sign-in",
            name: "Sign In",
            mode: "history",
            component: SignIn
        },
        {
            path: "/map",
            name: "City Map",
            component: CityMap
        },
        {
            path: "/admin/streets",
            name: "Admin Streets",
            component: StreetsList
        },
        {
            path: "/admin/named-entities",
            name: "Admin Named Entities",
            component: NamedEntitiesList
        }
    ]
});
