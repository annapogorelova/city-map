<template>
    <div class="row">
        <div class="col-12">
            <div class="row">
                <div class="col-12">
                    <cities-list ref="cities" v-on:citySelected="onCitySelected"
                                 v-bind:selected-city-id="cityId"></cities-list>
                </div>
            </div>
            <div class="row searchbox">
                <div class="col-12 col-lg-9">
                    <search v-on:search="onSearchStreet"
                            v-bind:placeholder="'Введіть назву вулиці та натисніть Enter'"></search>
                </div>
            </div>
            <div class="row sections-container">
                <div class="col-12 col-lg-9">
                    <div class="map-wrapper">
                        <basic-map ref="map" v-on:init="onMapInit" v-bind:zoom="zoom"></basic-map>
                    </div>
                </div>
                <div class="col-12 col-lg-3">
                    <transition name="slide-fade">
                        <div v-if="selectedStreet">
                            <street-description v-bind:street="selectedStreet"></street-description>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>
<style>
    .slide-fade-enter-active {
        transition: all .5s ease-in;
    }
    .slide-fade-leave-active {
        transition: all .8s ease-out;
    }
    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateX(100px);
        opacity: 0;
    }

    .map-wrapper {
        width: 100%;
        height: auto;
        margin-bottom: 20px;
    }

    .map {
        margin-top: 0 !important;
    }

    .sections-container {
        margin-top: 15px;
    }

    .searchbox {
        margin-top: 15px;
    }
</style>
<script>
    import Vue from "vue";
    import BasicMap from "../map/basic-map";
    import CitiesList from "../shared/cities-list";
    import StreetDescription from "./street-description";
    import Search from "../shared/search";
    import {optional} from "tooleks";
    import {provideImageMarkerHtml} from "../map/image-marker-provider";

    export default {
        components: {BasicMap, CitiesList, StreetDescription, Search},
        props: {
            zoom: {
                type: Number,
                default: 15
            }
        },

        data: function () {
            return {
                marker: undefined,
                selectedStreet: undefined,
                polyLines: [],
                cityId: undefined,
                coordinates: undefined
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

            if(Array.isArray(this.$route.query.coordinates)) {
                this.coordinates = this.$route.query.coordinates.map(c => parseFloat(c));
                this.setMarker(this.coordinates);
            }
        },
        methods: {
            findClosestStreet: (coordinates) => {
                return this.$dc.get("streets").getStreetByCoordinates(coordinates).then(response => {
                    return optional(() => response.data[0], null);
                });
            },
            setMarker(coordinates) {
                this.findClosestStreet(coordinates).then(street => {
                    if (street) {
                        this.setSelectedStreet(street, coordinates);
                    }
                });
            },
            setSelectedStreet(street, coordinates) {
                this.selectedStreet = null;

                Vue.nextTick(() => {
                    this.selectedStreet = street;
                    this.clearMap();
                    this.drawStreet(street);
                    if(coordinates) {
                        this.coordinates = coordinates;
                        this.$router.push({query: {...this.$route.query, coordinates: coordinates}});
                        this.setStreetMarker(coordinates, street);
                    }
                });
            },
            drawStreet(street) {
                    street.ways.map(way => {
                    this.polyLines.push(this.drawPolyline(way));
                });
            },
            clearMap() {
                if (this.marker) {
                    this.map.removeLayer(this.marker);
                }

                if (this.polyLines) {
                    this.polyLines.map(p => this.map.removeLayer(p));
                }
            },
            setStreetMarker(coordinates, street) {
                if(street.namedEntity && street.namedEntity.imageUrl) {
                    this.marker = this.renderImageMarker(coordinates, {
                        imageUrl: street.namedEntity.imageUrl,
                        title: street.namedEntity.name,
                        linkUrl: street.namedEntity.wikiUrl
                    });
                } else {
                    this.marker = L.marker(coordinates, {title: street.name});
                }

                this.marker.addTo(this.map);
                this.map.setView(coordinates);
            },
            drawPolyline(coordinates) {
                return L.polyline(coordinates, {opacity: 0.6, weight: 5}).addTo(this.map);
            },
            onMapInit() {
                this.map.on("click", function (e) {
                    this.setMarker([e.latlng.lat, e.latlng.lng], this.map);
                    this.$emit("init");
                }.bind(this));
            },
            onCitySelected(city) {
                if (city && city.id !== this.cityId) {
                    this.selectedStreet = null;
                    this.clearMap();
                    const query = {cityId: city.id};
                    this.$router.push({query: query});
                    this.$refs.map.setCenter(city.coordinates[0], city.coordinates[1], this.zoom);
                }
            },
            onSearchStreet(streetName) {
                this.$dc.get("streets").search({cityId: this.cityId, search: streetName}).then(response => {
                    const street = optional(() => response.data[0], null);

                    if(street) {
                        this.setSelectedStreet(street, optional(() => street.ways[0][0], null));
                    }
                });
            },
            renderImageMarker(coordinates, imageProps) {
                let icon = L.divIcon({html: provideImageMarkerHtml(imageProps)});
                return L.marker(coordinates, {icon, riseOnHover: true});
            }
        }
    }
</script>