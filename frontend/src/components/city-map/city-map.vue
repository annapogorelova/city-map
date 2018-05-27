<template>
    <div class="row page-wrapper">
        <div class="col-12">
            <div class="map-wrapper">
                <basic-map ref="map"
                           v-on:init="onMapInit"
                           v-on:locationsuccess="onLocationSuccess"
                           v-on:locationerror="onLocationError"
                           :height="mapHeight"
                           :zoom="zoom"></basic-map>
                <sidebar ref="sidebar" :width="400" :height="mapHeight">
                    <template slot="header">
                        <div class="row">
                            <div class="col-12">
                                <h1 v-if="city">Обране місто: {{city.name}}</h1>
                            </div>
                        </div>
                        <div class="row sidebar-section">
                            <div class="col-12">
                                <div class="search-container">
                                    <search ref="search"
                                            v-on:search="onSearchStreet"
                                            v-bind:placeholder="'Назва вулиці'"></search>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template slot="content">
                        <div class="row sidebar-section" v-if="selectedStreet">
                            <div class="col-12">
                                <street-description :street="selectedStreet"></street-description>
                            </div>
                        </div>
                        <div class="row sidebar-section" v-if="!selectedStreet">
                            <div class="col-12">
                                <p v-if="!searchInProgress && coordinates.length" class="no-margins">
                                    Тут не було знайдено жодної вулиці.
                                </p>
                                <p v-if="!searchInProgress && !coordinates.length" class="no-margins">
                                    Оберіть вулицю, щоб отримати інформацію про її назву.
                                </p>
                                <p v-if="searchInProgress" class="no-margins">Шукаємо...</p>
                            </div>
                        </div>
                    </template>
                    <template slot="footer">
                        <div class="row">
                            <div class="col-12 sidebar-footer">
                                <h6 v-if="city">{{city.name}}</h6>
                                <p v-if="selectedStreet">{{selectedStreet.name}}</p>
                            </div>
                        </div>
                    </template>
                </sidebar>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .page-wrapper {
        overflow: hidden;
    }

    .page-wrapper {
        padding: 0;
    }

    .page-wrapper > div {
        padding: 0;
    }

    .map-wrapper {
        position: relative;
        width: 100%;
        height: auto;
    }

    .map {
        margin-top: 0 !important;
    }

    .leaflet-div-icon {
        background: none;
        border: none;
    }

    .default-image-marker .image-marker {
        border: 1px solid #000000;
        background-color: #e5e5e5;
    }

    .sidebar-section:not(:first-child) {
        margin-top: 10px;
    }

    .search-container {
        width: 100%;
    }

    .sidebar-footer p {
        margin-bottom: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 0.9em;
    }

    h1, h2 {
        margin-bottom: 0;
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
    import {
        StreetsServiceMixin,
        NoticesServiceMixin,
        EventBusMixin,
        CitiesServiceMixin
    } from "../../mixins/index";
    import constants from "../../constants";
    import Sidebar from "../layout/sidebar";

    export default {
        components: {Sidebar, BasicMap, CitiesList, StreetDescription, Search},
        mixins: [
            StreetsServiceMixin,
            NoticesServiceMixin,
            EventBusMixin,
            CitiesServiceMixin
        ],
        props: {
            zoom: {
                type: Number,
                default: 13
            },
            focusZoom: {
                type: Number,
                default: 16
            }
        },
        data: function () {
            return {
                markers: [],
                selectedStreet: undefined,
                polyLines: [],
                city: undefined,
                coordinates: [],
                searchInProgress: false
            }
        },
        watch: {
            "$route.query.cityId": function (cityId) {
                if (!isNaN(cityId) && optional(() => this.city.id !== cityId)) {
                    this.citiesService.getCity(cityId).then(response => {
                        this.selectCity(response.data);
                    });
                }
            },
            city: function (city) {
                if (city && this.map) {
                    const bounds = optional(() => [city.bounds[0][0], city.bounds[0][2]]);
                    this.map.setMaxBounds(bounds);
                } else {
                    this.map.setMaxBounds([]);
                }
            },
            selectedStreet: function (street) {
                if(optional(() => street.namedEntities.length) && !this.sidebar.isOpen) {
                    this.sidebar.open();
                }
            }
        },
        computed: {
            map: function () {
                return this.$refs.map.getMap();
            },
            sidebar: function () {
                return this.$refs.sidebar;
            },
            search: function () {
                return this.$refs.search;
            },
            defaultImage: function () {
                return require("../../../assets/images/default-image.png");
            },
            cityId: function () {
                if (this.city) {
                    return this.city.id;
                } else if (!isNaN(this.$route.query.cityId)) {
                    return this.$route.query.cityId;
                }

                return null;
            },
            mapHeight: function () {
                return window.innerHeight - 57;
            }
        },
        created: function () {
            this.searchEventOff = this.eventBus.on("search", (search) => {
                this.onSearchStreet(search);
            });

            this.citySelectOff = this.eventBus.on("city-selected", (city) => {
                this.selectCity(city);
            });
        },
        mounted: function () {
            this.getLocation().then(coordinates => {
                if (coordinates.length) {
                    this.setMarker(coordinates);
                }
            });
        },
        beforeDestroy: function () {
            if (this.searchEventOff) {
                this.searchEventOff();
            }

            if (this.citySelectOff) {
                this.citySelectOff();
            }
        },
        methods: {
            getLocation: function () {
                if (Array.isArray(this.$route.query.coordinates)) {
                    return new Promise(resolve => resolve(this.$route.query.coordinates.map(c => parseFloat(c))));
                } else {
                    return new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition((position) => {
                            resolve([position.coords.latitude, position.coords.longitude]);
                        }, () => {
                            this.noticesService.error(
                                constants.NOTICES.FAILED_TO_GET_LOCATION.title,
                                constants.NOTICES.FAILED_TO_GET_LOCATION.message);
                            reject();
                        }, {timeout: 3000});
                    });
                }
            },
            findClosestStreet: function (coordinates) {
                if (!this.cityId) {
                    return Promise.reject();
                }

                this.searchInProgress = true;
                return this.streetsService.getStreetByCoordinates({
                    cityId: this.cityId,
                    coordinates: coordinates
                }).then(response => {
                    this.searchInProgress = false;
                    return optional(() => response.data, null);
                });
            },
            setMarker(coordinates) {
                this.selectedStreet = null;
                this.clearMap();

                this.findClosestStreet(coordinates).then(street => {
                    if (street) {
                        this.setSelectedStreet(street, coordinates);
                    } else {
                        let marker = this.addMarker({coordinates: coordinates});
                        marker.bindPopup(`
                            <b>${constants.NOTICES.NOT_A_STREET.title}</b>
                            <br>${constants.NOTICES.NOT_A_STREET.message}`)
                            .openPopup();
                    }
                });
            },
            setSelectedStreet(street, coordinates) {
                this.selectedStreet = null;

                Vue.nextTick(() => {
                    this.clearMap();

                    this.selectedStreet = street;
                    this.drawStreet(street);
                    this.setStreetMarker(coordinates, street);
                });
            },
            drawStreet(street) {
                street.ways.map(way => {
                    this.polyLines.push(this.drawPolyline(way));
                });
            },
            addMarker({coordinates, icon} = {}) {
                const marker = L.marker(coordinates, icon ? {icon: icon} : {});
                this.markers.push(marker);
                marker.addTo(this.map);
                this.setMapView(coordinates);
                return marker;
            },
            setMapView(coordinates) {
                this.coordinates = coordinates;
                this.$router.push({query: {...this.$route.query, coordinates: coordinates}});

                const mapZoom = this.map.getZoom();
                const zoom = mapZoom > this.focusZoom ? mapZoom : this.focusZoom;
                this.map.setView(coordinates, zoom);
            },
            resetCoordinates() {
                this.coordinates = [];
                this.$router.push({query: {...this.$route.query, coordinates: []}});
            },
            clearMap() {
                this.removeMarkers();
                this.removePolyLines();
            },
            removeMarkers() {
                this.markers.map(m => this.map.removeLayer(m));
                this.markers = [];
            },
            removePolyLines() {
                this.polyLines.map(p => this.map.removeLayer(p));
                this.polyLines = [];
            },
            setStreetMarker(coordinates, street) {
                if (street.namedEntities.length) {
                    const namedEntities = _.sortBy(street.namedEntities, n => n.imageUrl !== null);
                    for (let i = 0; i < namedEntities.length; i++) {
                        this.markers.push(this.renderImageMarker({
                            coordinates: coordinates,
                            imageProps: {
                                imageUrl: namedEntities[i].imageUrl || this.defaultImage,
                                title: `${namedEntities[i].name} на Wikipedia`,
                                linkUrl: namedEntities[i].wikiUrl,
                                styles: namedEntities.length > 1 ? {"margin-left": `-${i * 50}px`} : null
                            },
                            className: namedEntities[i].imageUrl ? "" : "default-image-marker"
                        }));
                    }

                    this.markers.map(m => m.addTo(this.map));
                } else {
                    let marker = this.addMarker({coordinates: coordinates});
                    let popupContent = `<b>${street.name}</b>`;
                    if(street.oldName) {
                        popupContent += `<br/><span>(стара назва: ${street.oldName})</span>`;
                    }
                    marker.bindPopup(popupContent).openPopup();
                }

                this.setMapView(coordinates);
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
            selectCity(city) {
                this.city = city;
                this.selectedStreet = null;
                this.resetCoordinates();
                this.clearMap();
                this.map.setView(city.coordinates, this.zoom);
            },
            onSearchStreet(streetName) {
                if (!streetName) {
                    return;
                }

                this.streetsService.search({cityId: this.cityId, search: streetName}).then(response => {
                    const street = optional(() => response.data[0], null);

                    if (street) {
                        this.search.clear();
                        this.setSelectedStreet(street, optional(() => street.ways[0][0], null));
                    } else {
                        this.clearMap();
                        this.resetCoordinates();
                        this.selectedStreet = null;
                        this.noticesService.info(
                            constants.NOTICES.STREET_NOT_FOUND.title,
                            constants.NOTICES.STREET_NOT_FOUND.message
                        );
                    }
                });
            },
            renderImageMarker({coordinates, imageProps, className} = {}) {
                let icon = L.divIcon({html: provideImageMarkerHtml(imageProps), className: className});
                return L.marker(coordinates, {icon, riseOnHover: true});
            },
            onLocationSuccess(event) {
                this.setMarker([event.latitude, event.longitude]);
            },
            onLocationError() {
                this.noticesService.error(
                    constants.NOTICES.FAILED_TO_GET_LOCATION.title,
                    constants.NOTICES.FAILED_TO_GET_LOCATION.message
                )
            }
        }
    }
</script>