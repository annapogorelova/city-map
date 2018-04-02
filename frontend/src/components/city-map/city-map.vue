<template>
    <div class="row">
        <div class="col-12">
            <div class="row">
                <div class="col-12">
                    <cities-list ref="cities" v-on:citySelected="onCitySelected"
                                 v-bind:selected-city-id="cityId"></cities-list>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="map-wrapper">
                        <basic-map ref="map" v-on:init="onMapInit"></basic-map>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import BasicMap from "../map/basic-map";
    import CitiesList from "./cities-list";
    import {streetService} from "../../services";
    import {optional} from "tooleks";

    export default {
        components: {BasicMap, CitiesList},

        data: function () {
            return {
                search: undefined,
                marker: undefined,
                selectedStreet: undefined,
                polyLines: [],
                cityId: undefined
            }
        },
        computed: {
            map: function () {
                return this.$refs.map.getMap();
            },
        },
        mounted: function() {
            if(!isNaN(this.$route.query.cityId)) {
                this.cityId = parseInt(this.$route.query.cityId);
            }
        },
        methods: {
            findClosestStreet: (coordinates) => {
                return streetService.getStreetByCoordinates(coordinates).then(data => {
                    return optional(() => data[0], null);
                });
            },
            setMarker(coordinates) {
                if (this.marker) {
                    this.map.removeLayer(this.marker);
                }
                this.marker = L.marker(coordinates).addTo(this.map);
                this.findClosestStreet(coordinates).then(street => {
                    if (street) {
                        this.selectedStreet = street;
                        this.$router.push({query: {...this.$route.query, street: street.id}});

                        if (this.polyLines) {
                            this.polyLines.map(p => this.map.removeLayer(p));
                        }

                        street.ways.map(way => {
                            this.polyLines.push(this.drawPolyline(way));
                        });
                    }
                });
            },
            drawPolyline(coordinates) {
                return L.polyline(coordinates, {opacity: 0.4, weight: 5}).addTo(this.map);
            },
            onMapInit() {
                this.map.on("click", function (e) {
                    this.setMarker([e.latlng.lat, e.latlng.lng], this.map);
                    this.$emit("init");
                }.bind(this));
            },
            onCitySelected(city) {
                if (city) {
                    this.$router.push({query: {cityId: city.id}});
                    this.$refs.map.setCenter(city.coordinates[0], city.coordinates[1], 15);
                }
            }
        }
    }
</script>
<style>
    .map-wrapper {
        width: 100%;
        height: 100%;
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