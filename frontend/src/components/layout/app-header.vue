<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <router-link class="navbar-brand" to="/map">City Map</router-link>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown"
                       aria-haspopup="true" aria-expanded="false">
                        Міста
                    </a>
                    <cities-list ref="cities"
                                 v-on:citySelected="onCitySelected"
                                 v-bind:preselect-default="true"></cities-list>
                </li>
                <li class="nav-item">
                    <router-link v-if="isAuthenticated" class="nav-link" to="/admin/streets">Вулиці</router-link>
                </li>
                <li class="nav-item">
                    <router-link v-if="isAuthenticated" class="nav-link" to="/admin/named-entities">Персони</router-link>
                </li>
                <li class="nav-item">
                    <router-link v-if="isAuthenticated" class="nav-link" to="/sign-out">
                        <i class="fa fa-sign-out-alt sign-out"></i>
                    </router-link>
                </li>
            </ul>
            <form class="search-input-container form-inline my-2 my-lg-0" v-on:submit.prevent>
                <search v-on:search="onSearchStreet"
                        v-bind:placeholder="'Назва вулиці'"></search>
                <button class="btn btn-outline-success my-2 my-sm-0 btn-search" type="button">Шукати</button>
            </form>
        </div>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    </nav>
</template>
<script>
    import {AuthMixin} from "../../mixins";
    import CitiesList from "../shared/cities-list";
    import Search from "../shared/search";

    export default {
        components: {CitiesList, Search},
        mixins: [AuthMixin],
        methods: {
            onSearchStreet: function(search) {
                this.$dc.get("eventBus").emit("search", search);
            },
            onCitySelected: function(city) {
                this.$dc.get("eventBus").emit("city-selected", city);
            }
        }
    }
</script>
<style>
    .sign-out {
        margin-left: 10px;
    }

    .btn-search {
        margin-left: 5px;
    }
</style>