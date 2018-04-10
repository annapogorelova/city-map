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
                        <basic-map ref="map" v-on:init="onMapInit" v-bind:zoom="zoom"></basic-map>
                    </div>
                    <div v-if="selectedStreet">
                        <street-description v-bind:street="selectedStreet"></street-description>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import BasicMap from "../map/basic-map";
    import CitiesList from "./cities-list";
    import StreetDescription from "./street-description";
    import {streetService} from "../../services";
    import {optional} from "tooleks";
    import {provideImageMarkerHtml} from "../map/image-marker-provider";

    export default {
        components: {BasicMap, CitiesList, StreetDescription},
        props: {
            zoom: {
                type: Number,
                default: 15
            }
        },

        data: function () {
            return {
                search: undefined,
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
                return streetService.getStreetByCoordinates(coordinates).then(data => {
                    return optional(() => data[0], null);
                });
            },
            setMarker(coordinates) {
                this.findClosestStreet(coordinates).then(street => {
                    if (street) {
                        this.selectedStreet = street;
                        this.coordinates = coordinates;

                        this.$router.push({query: {...this.$route.query, coordinates: coordinates}});
                        this.drawStreet(street);
                        this.setStreetMarker(coordinates, street);
                    }
                });
            },
            drawStreet(street) {
                if (this.polyLines) {
                    this.polyLines.map(p => this.map.removeLayer(p));
                }

                street.ways.map(way => {
                    this.polyLines.push(this.drawPolyline(way));
                });
            },
            setStreetMarker(coordinates, street) {
                if (this.marker) {
                    this.map.removeLayer(this.marker);
                }

                if(street.person && street.namedEntity.imageUrl) {
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
                if (city) {
                    const query = this.cityId !== city.id ?
                        {cityId: city.id} : {...this.$route.query, cityId: city.id};
                    this.$router.push({query: query});
                    this.$refs.map.setCenter(city.coordinates[0], city.coordinates[1], this.zoom);
                }
            },
            renderImageMarker(coordinates, imageProps) {
                let icon = L.divIcon({html: provideImageMarkerHtml(imageProps)});
                return L.marker(coordinates, {icon, riseOnHover: true});
            }
        }
    }
</script>
<style>
    .map-wrapper {
        width: 100%;
        height: auto;
        margin-bottom: 20px;
    }
</style>