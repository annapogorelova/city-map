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
                        {{citiesHeader}}
                    </a>
                    <cities-list ref="cities"
                                 v-on:citySelected="onCitySelected"
                                 v-bind:preselected-city-id="initialCityId"
                                 v-bind:preselect-default="true"></cities-list>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                    <router-link class="nav-link" to="/admin/streets">{{streetsHeader}}</router-link>
                </li>
                <li class="nav-item" v-if="isAuthenticated">
                    <router-link class="nav-link" to="/admin/named-entities">{{namedEntitiesHeader}}</router-link>
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

    export default {
        components: {CitiesList},
        mixins: [AuthMixin, EventBusMixin],
        data: function () {
            return {
                city: undefined,
                initialCityId: undefined
            }
        },
        computed: {
            appName: () => appConfig.appName,
            citiesHeader: () => constants.HEADERS.CITIES,
            streetsHeader: () => constants.HEADERS.STREETS,
            namedEntitiesHeader: () => constants.HEADERS.NAMED_ENTITES,
            contactHeader: () => constants.HEADERS.CONTACT,
            logo: function () {
                return require("../../../static/images/logo.png");
            }
        },
        watch: {
            '$route': function (route) {
                if(!route.meta.dependsOnCity) {
                    return;
                }

                const cityId = parseInt(route.query.cityId);
                if(this.city && cityId !== this.city.id) {
                    this.$router.push({query: {cityId: this.city.id, ...route.query}});
                    this.eventBus.emit("city-selected", this.city);
                }
            }
        },
        created: function () {
            if(!isNaN(optional(() => this.$route.query.cityId))) {
                this.initialCityId = parseInt(this.$route.query.cityId);
            }
        },
        methods: {
            onCitySelected: function(city) {
                this.city = city;

                if(this.$route.meta.dependsOnCity) {
                    let query = {...this.$route.query};
                    query.cityId = city.id;
                    query.coordinates = undefined;
                    this.$router.push({query: query});
                    this.eventBus.emit("city-selected", city);
                }
            }
        }
    }
</script>
<style>
    .sign-out {
        margin-left: 10px;
    }

    .app-navbar .nav-link {
        color: rgba(255, 255, 255, 0.8) !important;
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

    .navbar-brand span {
        font-size: 1.25rem !important;
        vertical-align: middle;
    }
</style>