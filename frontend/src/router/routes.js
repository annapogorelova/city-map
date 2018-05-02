import SignIn from "../components/auth/sign-in";
import CityMap from "../components/city-map/city-map";
import StreetsList from "../components/admin/streets-list";
import NamedEntitiesList from "../components/admin/named-entities-list";

const routes = [
    {
        path: "/sign-in",
        name: "sign-in",
        meta: {
            requiresAuth: false,
        },
        component: SignIn
    },
    {
        path: "/map",
        name: "map",
        meta: {
            requiresAuth: false,
        },
        component: CityMap
    },
    {
        path: "/admin/streets",
        name: "admin-streets",
        meta: {
            requiresAuth: true,
        },
        component: StreetsList
    },
    {
        path: "/admin/named-entities",
        name: "admin-named-entities",
        meta: {
            requiresAuth: true,
        },
        component: NamedEntitiesList
    }
];

export default routes;