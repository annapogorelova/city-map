<template>
    <div class="row">
        <div class="col-12">
            <div class="row">
                <div class="col-12">
                    <div class="search-container">
                        <input v-model="search"
                               v-on:blur="hideAutocomplete()"
                               title="Search" type="text" placeholder="Search" class="form-control"/>
                        <div class="search-results" v-if="isAutocompleteShown">
                            <span class="search-result" v-for="result in searchResults">
                                {{result.label}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="map-wrapper">
                        <div id="cityMap" class="map-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapService} from "../../services";
    import _ from "lodash";

    export default {
        name: 'city-map',

        data: function () {
            return {
                cityMap: null,
                geoProvider: null,
                search: null,
                searchResults: null,
                isAutocompleteShown: false
            }
        },

        watch: {
            search: function (searchPhrase) {
                this.searchAddress(searchPhrase);
            }
        },

        mounted: function () {
            this.$nextTick(function () {
                this.initMap();
            })
        },

        methods: {
            initMap: async function () {
                this.cityMap = await mapService.createMap("cityMap", 13, "OpenStreetMap.Mapnik");
            },

            searchAddress: _.debounce(function(searchPhrase) {
                mapService.search(searchPhrase).then(results => {
                    this.searchResults = this.mapSearchResults(results);
                    this.isAutocompleteShown = results.length > 0;
                });
            }, 500),

            mapSearchResults(results) {
                return results.map(r => {
                    return {
                      label: r.label,
                      position: {
                          latitude: r.raw.lat,
                          longitude: r.raw.lon
                      }
                    };
                });
            },

            hideAutocomplete() {
                this.isAutocompleteShown = false;
            }
        }
    }
</script>
<style>
    .map-wrapper {
        width: 100%;
        height: 100%;
    }

    .map-container {
        height: 500px;
        width: 100%;
        margin-top: 15px;
    }

    .search-container {
        position: relative;
    }

    .search-results {
        position: absolute;
        background: #ffffff;
        z-index: 99999;
        width: 100%;
        padding: 5px 10px;
    }

    .search-result {
        display: block;
        padding: 5px 0;
    }
</style>