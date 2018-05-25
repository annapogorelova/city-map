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
            showHeader: true
        },
        component: SignIn
    },
    {
        path: "/sign-out",
        name: "sign-out",
        meta: {
            requiresAuth: true,
            showHeader: true
        },
        component: SignOut
    },
    {
        path: "/map",
        name: "map",
        meta: {
            requiresAuth: false,
            showHeader: true
        },
        component: CityMap
    },
    {
        path: "/admin/streets",
        name: "admin-streets",
        meta: {
            requiresAuth: true,
            showHeader: true
        },
        component: StreetsList
    },
    {
        path: "/admin/named-entities",
        name: "admin-named-entities",
        meta: {
            requiresAuth: true,
            showHeader: true
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
            showHeader: false
        },
        component: NotFoundPageComponent
    }
];

export default routes;