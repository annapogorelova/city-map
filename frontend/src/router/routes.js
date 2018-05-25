import SignIn from "../components/auth/sign-in";
import SignOut from "../components/auth/sign-out";
import CityMap from "../components/city-map/city-map";
import StreetsList from "../components/admin/streets-list";
import NamedEntitiesList from "../components/admin/named-entities-list";
import NotFoundPageComponent from "../components/shared/not-found";

const routes = [
    {
        path: "/",
        redirect: "/map"
    },
    {
        path: "/sign-in",
        name: "sign-in",
        meta: {
            requiresAuth: false,
            showHeader: true,
            dependsOnCity: false
        },
        component: SignIn
    },
    {
        path: "/sign-out",
        name: "sign-out",
        meta: {
            requiresAuth: true,
            showHeader: true,
            dependsOnCity: false
        },
        component: SignOut
    },
    {
        path: "/map",
        name: "map",
        meta: {
            requiresAuth: false,
            showHeader: true,
            dependsOnCity: true
        },
        component: CityMap
    },
    {
        path: "/admin/streets",
        name: "admin-streets",
        meta: {
            requiresAuth: true,
            showHeader: true,
            dependsOnCity: true
        },
        component: StreetsList
    },
    {
        path: "/admin/named-entities",
        name: "admin-named-entities",
        meta: {
            requiresAuth: true,
            showHeader: true,
            dependsOnCity: false
        },
        component: NamedEntitiesList
    },
    {
        path: "*",
        redirect: "/404"
    },
    {
        path: "/404",
        name: "not-found",
        meta: {
            requiresAuth: false,
            showHeader: false,
            dependsOnCity: false
        },
        component: NotFoundPageComponent
    }
];

export default routes;