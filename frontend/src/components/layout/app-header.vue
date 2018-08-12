<template>
    <nav class="app-navbar navbar navbar-expand-lg navbar-dark bg-dark">
        <router-link class="navbar-brand" to="/map">
            <img class="logo" :src="logo"/><span>{{appName}}</span>
        </router-link>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="citiesDropdown" data-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false">
                        {{selectedCity ? selectedCity.name : citiesHeader}}
                    </a>
                    <cities-list ref="cities"></cities-list>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                    <router-link class="nav-link" to="/dark/streets">{{streetsHeader}}</router-link>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                    <router-link class="nav-link" to="/dark/named-entities">{{namedEntitiesHeader}}</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/about">{{aboutHeader}}</router-link>
                </li>
                <li class="nav-item">
                    <router-link class="nav-link" to="/contact">{{contactHeader}}</router-link>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                    <router-link class="nav-link" to="/sign-out">
                        <i class="fa fa-sign-out-alt sign-out" title="'Вихід'"></i>
                    </router-link>
                </li>
            </ul>
        </div>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </nav>
</template>
<script>
    import {AuthMixin, EventBusMixin} from "../../mixins";
    import CitiesList from "../shared/cities-list";
    import {optional} from "tooleks";
    import constants from "../../constants";
    import appConfig from "../../app.config";
    import {mapState} from "vuex";

    export default {
        components: {CitiesList},
        mixins: [AuthMixin, EventBusMixin],
        computed: {
            ...mapState({
                selectedCity: store => store.cities.selectedCity
            }),
            appName: () => appConfig.appName,
            citiesHeader: () => constants.HEADERS.CITIES,
            streetsHeader: () => constants.HEADERS.STREETS,
            namedEntitiesHeader: () => constants.HEADERS.NAMED_ENTITES,
            contactHeader: () => constants.HEADERS.CONTACT,
            aboutHeader: () => constants.HEADERS.ABOUT,
            logo: function () {
                return require("../../../static/images/logo.png");
            }
        }
    }
</script>
<style lang="scss">
    .sign-out {
        margin-left: 10px;
    }

    .app-navbar {
        padding-top: 5px !important;
        padding-bottom: 5px !important;

        .nav-link {
            color: rgba(255, 255, 255, 0.8) !important;
            padding-top: 5px !important;
            padding-bottom: 5px !important;
            font-size: 1rem !important;
        }
    }

    .app-navbar .nav-link.router-link-active, .nav-item.dropdown.show .nav-link {
        color: #ffffff !important;
    }

    .dropdown-item.active, .dropdown-item:active {
        background-color: #0056b2 !important;
    }

    .fa-envelope {
        margin-left: 2px;
    }

    .logo {
        margin-right: 8px;
    }

    .navbar-brand {
        font-size: 1rem !important;

        span {
            font-size: 1rem !important;
            vertical-align: middle;
        }
    }
</style>