<template>
    <div class="row page-wrapper">
        <loader :loading="searchInProgress && !sidebar.isOpen" :delay="200"></loader>
        <div class="col-12">
            <div id="map-wrapper" class="map-wrapper">
                <basic-map ref="map"
                           v-on:init="onMapInit"
                           v-on:locationsuccess="onLocationSuccess"
                           v-on:locationerror="onLocationError"
                           :height="mapHeight"
                           :locationTimeout="locationTimeout"
                           :zoom="zoom"></basic-map>
                <sidebar ref="sidebar" :width="400" :height="mapHeight">
                    <template slot="header">
                        <div class="row sidebar-section">
                            <div class="col-12">
                                <div class="search-container" v-on:click.stop>
                                    <label for="streetSearchInput">{{constants.searchLabel}}</label>
                                    <search ref="search"
                                            v-on:search="onSearchStreet"
                                            v-bind:inputId="'streetSearchInput'"
                                            v-bind:placeholder="constants.searchPlaceholder"></search>
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
                        <div class="row sidebar-section">
                            <div class="col-12" v-if="!selectedStreet">
                                <p v-if="!searchInProgress">
                                    {{constants.chooseStreetCaption}}
                                </p>
                                <p v-if="!searchInProgress" class="text-muted">
                                    {{constants.howToChooseStreet}}
                                </p>
                                <div v-if="searchInProgress">
                                    <span class="search-caption">{{constants.searchingCaption}}</span>
                                    <i class="fas fa-circle-notch fa-spin"></i>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template slot="footer">
                        <div class="row">
                            <div class="col-12 sidebar-footer">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="search-in-progress" v-if="searchInProgress">
                                            <span class="search-caption">{{constants.searchingCaption}}</span>
                                            <i class="fas fa-circle-notch fa-spin"></i>
                                        </div>
                                        <div v-if="!searchInProgress && !selectedStreet">
                                            <p v-if="!searchInProgress" class="choose-street-caption">
                                                {{constants.chooseStreetCaption}}
                                            </p>
                                            <p v-if="!searchInProgress" class="text-muted">
                                                {{constants.howToChooseStreet}}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="row street-description">
                                    <div class="col-12" v-if="selectedStreet">
                                        <h2>{{selectedStreet.name}}</h2>
                                        <div v-if="activeNamedEntityTitle">
                                            <h2 class="named-entity-name"><b>{{constants.namedAfterCaption}}:</b>
                                                {{activeNamedEntityTitle}}</h2>
                                        </div>
                                        <div v-if="selectedStreet.namedEntities.length || selectedStreet.description">
                                            <button type="button" class="btn btn-sm btn-outline-dark open-sidebar"
                                                    v-on:click="sidebar.open">
                                                {{constants.readDescription}}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </sidebar>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
    h1, h2 {
        margin-bottom: 0;
    }

    @media (max-width: 600px) {
        h2, h4 {
            margin-bottom: 5px !important;
        }
    }

    b {
        font-weight: 500;
    }

    .page-wrapper {
        overflow: hidden;
        padding: 0;

        & > div {
            padding: 0;
        }
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

        label {
            margin-bottom: 5px;
        }
    }

    .sidebar-footer {
        h1, h2 {
            margin-bottom: 8px;
        }

        h2.named-entity-name {
            font-weight: 400;
        }

        h4 {
            font-weight: 400;
        }

        .street-description {
            max-height: 120px;
            overflow-y: auto;

            p {
                white-space: normal;
            }

            h2 {
                font-size: 0.9rem !important;
            }

            button.open-sidebar {
                margin-top: 5px;
            }
        }

        @media(max-width: 767px) {
            p.choose-street-caption {
                margin-right: 25px;
            }
        }
    }

    .fa-spin {
        margin-left: 5px;
    }

    .search-in-progress {
        margin-top: 5px;
    }

    .search-caption {
        font-size: 1rem !important;
    }

    @media (max-width: 360px) {
        .sidebar-footer .street-description {
            h2 {
                margin-right: 20px;
            }
        }
    }

    p.text-muted {
        font-size: 0.7rem !important;
    }
</style>
<script>
    import BasicMap from "../map/basic-map";
    import CitiesList from "../shared/cities-list";
    import StreetDescription from "./street-description";
    import Search from "../shared/search";
    import {optional, Defer} from "tooleks";
    import {provideImageMarkerHtml} from "../map/image-marker-provider";
    import {
        StreetsServiceMixin,
        NoticesServiceMixin,
        EventBusMixin,
        CitiesServiceMixin,
        ConstantsMixin
    } from "../../mixins/index";
    import constants from "../../constants";
    import appConfig from "../../app.config";
    import Sidebar from "../layout/sidebar";
    import _ from "lodash";
    import Loader from "../shared/loader";

    export default {
        components: {Loader, Sidebar, BasicMap, CitiesList, StreetDescription, Search},
        mixins: [
            StreetsServiceMixin,
            NoticesServiceMixin,
            EventBusMixin,
            CitiesServiceMixin,
            ConstantsMixin
        ],
        props: {
            zoom: {
                type: Number,
                default: 13
            },
            focusZoom: {
                type: Number,
                default: 16
            },
            topBarHeight: {
                type: Number,
                default: 52
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
                if (!isNaN(cityId) && (!this.city || this.city.id !== cityId)) {
                    this.citiesService.getCity(cityId).then(response => {
                        this.selectCity(response.data);
                    });
                }
            },
            city: function (city) {
                this.setCoordinates(optional(() => city.coordinates, []));
                this.clearMap();

                const bounds = optional(() => [city.bounds[0][0], city.bounds[0][2]], []);
                this.map.setMaxBounds(bounds);
                if (city) {
                    this.$refs.map.panTo(city.coordinates);
                    this.map.setZoom(this.zoom);
                }
            },
            coordinates: function (coordinates) {
                this.$router.push({query: {...this.$route.query, lat: coordinates[0], lng: coordinates[1]}});
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
                return require("../../../static/images/default-image.png");
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
                return window.innerHeight - this.topBarHeight;
            },
            locationTimeout: function () {
                return appConfig.locationTimeout;
            },
            activeNamedEntityTitle: function () {
                if (optional(() => this.selectedStreet.namedEntities.length)) {
                    if (this.selectedStreet.namedEntities.length < 3) {
                        return this.selectedStreet.namedEntities.map(n => n.name).join(", ");
                    }

                    return `${this.selectedStreet.namedEntities[0].name} та ${this.selectedStreet.namedEntities.length - 1} інших`;
                }

                return "";
            }
        },
        created: function () {
            this.searchEventOff = this.eventBus.on("search", (search) => {
                this.onSearchStreet(search);
            });

            this.cityDefer = new Defer();

            this.citySelectOff = this.eventBus.on("city-selected", (city) => {
                this.selectCity(city);
                this.cityDefer.resolve(city);
            });
        },
        mounted: function () {
            this.init();
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
            init: function () {
                return Promise.all([
                    this.getLocation(),
                    this.cityDefer.promisify()
                ]).then((data) => {
                    this.setCoordinates(data[0]);
                    this.setMarker(this.coordinates, this.cityId);
                });
            },
            getLocation: function () {
                return new Promise((resolve, reject) => {
                    if (this.$route.query.lat && this.$route.query.lng) {
                        resolve([parseFloat(this.$route.query.lat), parseFloat(this.$route.query.lng)]);
                    } else {
                        navigator.geolocation.getCurrentPosition((position) => {
                            resolve([position.coords.latitude, position.coords.longitude]);
                        }, () => {
                            reject();
                        }, {timeout: this.locationTimeout});
                    }
                });
            },
            findClosestStreet: function (coordinates, cityId) {
                this.searchInProgress = true;
                return this.streetsService.getStreetByCoordinates({
                    cityId: cityId,
                    coordinates: coordinates
                }).then(response => {
                    this.searchInProgress = false;
                    return response.data;
                }).catch(() => {
                    this.searchInProgress = false;
                });
            },
            setMarker: function (coordinates, cityId) {
                return new Promise((resolve, reject) => {
                    this.selectedStreet = null;

                    this.findClosestStreet(coordinates, cityId).then(street => {
                        try {
                            this.clearMap();

                            if (street) {
                                this.setSelectedStreet(street, coordinates);
                            } else {
                                const marker = L.marker(coordinates);
                                this.markers.push(marker);

                                marker
                                    .addTo(this.map)
                                    .bindPopup(`<b>${constants.NOTICES.NOT_A_STREET.title}</b><br>${constants.NOTICES.NOT_A_STREET.message}`)
                                    .openPopup();

                                this.setMapView(coordinates);
                            }

                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            },
            setSelectedStreet(street, coordinates) {
                this.selectedStreet = street;
                this.setCoordinates(coordinates);
                this.drawStreet(street);
                this.setStreetMarker(coordinates, street);
            },
            drawStreet(street) {
                street.ways.map(way => {
                    this.polyLines.push(this.drawPolyline(way));
                });
            },
            setMapView(coordinates) {
                const currentZoom = this.map.getZoom();
                this.map.setView(coordinates, currentZoom >= this.focusZoom ? currentZoom : this.focusZoom);
            },
            /**
             * Sets new coordinates if they have changed, returns true if changed, false if not
             * @param coordinates
             * @returns {boolean}
             */
            setCoordinates(coordinates) {
                const newCoordinates = coordinates.length ?
                    coordinates.map(c => parseFloat(c).toFixed(appConfig.coordinatesPrecision)) : [];
                if (this.coordinatesChanged(newCoordinates, this.coordinates)) {
                    this.coordinates = newCoordinates;
                    return true;
                }

                return false;
            },
            coordinatesChanged(newCoordinates, oldCoordinates) {
                if(!newCoordinates.length && !oldCoordinates.length) {
                    return false;
                }

                return newCoordinates[0] !== oldCoordinates[0] || newCoordinates[1] !== oldCoordinates[1];
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
                        const marker = this.makeNamedEntityMarker(
                            coordinates,
                            namedEntities[i],
                            namedEntities.length > 1 ? {"margin-left": `-${i * 50}px`} : null);

                        marker.on("click", this.sidebar.toggle).addTo(this.map);
                        this.markers.push(marker);
                    }
                } else {
                    const marker = this.makeStreetMarker(coordinates, street);
                    marker.on("click", this.sidebar.toggle).addTo(this.map).openPopup();
                    this.markers.push(marker);
                }

                this.setMapView(coordinates);
            },
            makeNamedEntityMarker(coordinates, namedEntity, styles = null) {
                return this.renderImageMarker({
                    coordinates: coordinates,
                    imageProps: {
                        imageUrl: namedEntity.imageUrl || this.defaultImage,
                        title: `${namedEntity.name} (${this.constants.showDetailsCaption.toLowerCase()})`,
                        styles: styles
                    },
                    className: namedEntity.imageUrl ? "" : "default-image-marker"
                });
            },
            makeStreetMarker(coordinates, street) {
                let marker = L.marker(coordinates);
                let popupContent = `<b>${street.name}</b>`;
                if (street.oldName) {
                    popupContent += `<br/><span>(${this.constants.oldStreetNameCaption.toLowerCase()}: ${street.oldName})</span>`;
                }
                marker.bindPopup(popupContent);
                return marker;
            },
            drawPolyline(coordinates) {
                return L.polyline(coordinates, {opacity: 0.6, weight: 5}).addTo(this.map);
            },
            onMapInit() {
                this.map.on("click", this.onMapClick);
            },
            onMapClick: _.debounce(function (e) {
                this.setCoordinates([e.latlng.lat, e.latlng.lng]);
                this.clearMap();
                this.setMarker(this.coordinates, this.cityId);
            }, 500),
            selectCity(city) {
                this.city = city;
                this.selectedStreet = null;
            },
            onSearchStreet(streetName) {
                return new Promise((resolve, reject) => {
                    if (!streetName) {
                        reject();
                    }

                    this.streetsService.search({cityId: this.cityId, search: streetName}).then(response => {
                        const street = optional(() => response.data[0], null);

                        this.clearMap();

                        if (street) {
                            this.search.clear();
                            this.setSelectedStreet(street, optional(() => street.ways[0][0], null));
                        } else {
                            this.setCoordinates([]);
                            this.selectedStreet = null;
                            this.noticesService.info(
                                constants.NOTICES.STREET_NOT_FOUND.title,
                                constants.NOTICES.STREET_NOT_FOUND.message
                            );
                        }

                        resolve();
                    });
                });
            },
            renderImageMarker({coordinates, imageProps, className} = {}) {
                let icon = L.divIcon({html: provideImageMarkerHtml(imageProps), className: className});
                return L.marker(coordinates, {icon, riseOnHover: true});
            },
            onLocationSuccess(event) {
                let updated = this.setCoordinates([event.latitude, event.longitude]);
                if (updated) {
                    this.setMarker(this.coordinates, this.cityId);
                }
            },
            onLocationError() {
                this.noticesService.warning(
                    constants.NOTICES.FAILED_TO_GET_LOCATION.title,
                    constants.NOTICES.FAILED_TO_GET_LOCATION.message
                )
            }
        }
    }
</script>