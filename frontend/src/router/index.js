import Vue from "vue";
import Router from "vue-router";
import SignIn from "../components/auth/sign-in";
import CityMap from "../components/city-map/city-map";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/sign-in',
            name: 'Sign In',
            component: SignIn
        },
        {
            path: '/city-map',
            name: 'City Map',
            component: CityMap
        }
    ]
})
