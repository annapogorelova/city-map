<template>
    <div class="row">
        <div class="col-12">
            <div class="row">
                <div class="col-12">
                    <div class="search-container">
                        <input v-model="search" title="Search" type="text" placeholder="Search" class="form-control"/>
                        <div class="search-results" v-if="searchResults">
                            <span v-for="result in searchResults">
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

    export default {
        name: 'city-map',

        data: function () {
            return {
                cityMap: null,
                geoProvider: null,
                search: null,
                searchResults: null
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

            searchAddress: function(searchPhrase) {
                mapService.search(searchPhrase).then(results => {
                    this.searchResults = this.mapSearchResults(results);
                });
            },

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
    }
</style>