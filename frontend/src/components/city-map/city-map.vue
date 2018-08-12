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
    import {mapState} from "vuex";
    import mutationTypes from "../../store/mutation-types";

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
                coordinates: [],
                searchInProgress: false
            }
        },
        watch: {
            coordinates: function (coordinates) {
                this.$router.push({query: {...this.$route.query, lat: coordinates[0], lng: coordinates[1]}});
            }
        },
        computed: {
            ...mapState({
                selectedCity: state => state.cities.selectedCity,
                cities: state => state.cities.cities
            }),
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
            streetMarkerImage: function () {
                return require("../../../static/images/city.png");
            },
            cityId: function () {
                return optional(() => this.selectedCity.id);
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

            this.citiesDefer = new Defer();

            this.$store.subscribe((mutation) => {
                if (mutation.type === `cities/${mutationTypes.CITIES.SET_CITIES}`) {
                    this.citiesDefer.resolve(mutation.payload);
                } else if (mutation.type === `cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`) {
                    // If new city and route with map is activated
                    if (this.$route.name === "map") {
                        this.focusOnCity(this.selectedCity);
                    }
                }
            });
        },
        mounted: function () {
            this.init();
        },
        beforeDestroy: function () {
            if (this.searchEventOff) {
                this.searchEventOff();
            }
        },
        methods: {
            init: function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        const asyncActions = [this.getLocation()];
                        if(!this.cities) {
                            asyncActions.push(this.citiesDefer.promisify());
                        }
                        const [coordinates] = await Promise.all(asyncActions);

                        const cityId = parseInt(this.$route.query.cityId);
                        const cityExists = this.cities.find(city => city.id === cityId);

                        // If there is cityId in query and city with this id exists - select the city by id
                        // If no city - try to detect it by coordinates
                        // If no coordinates - select first city
                        if (!isNaN(cityId) && cityExists) {
                            const city = this.cities.find(city => city.id === cityId);
                            if (city) {
                                this.selectCity(city);
                            }

                            if (coordinates && this.coordinatesBelongToCity(coordinates, city)) {
                                this.setCoordinates(coordinates);
                                this.setMarker(this.coordinates, city.id, true);
                            } else {
                                this.setCoordinates([]);
                            }
                        } else if (isNaN(cityId) && coordinates) {
                            const city = this.autoDetectCity(coordinates);

                            if (city) {
                                this.selectCity(city);
                                this.setCoordinates(coordinates);
                                this.setMarker(this.coordinates, city.id, true);
                            } else {
                                this.noticesService.info(
                                    constants.NOTICES.CITY_NOT_SUPPORTED.title,
                                    constants.NOTICES.CITY_NOT_SUPPORTED.message
                                );
                            }
                        } else if (!coordinates || !cityExists) {
                            this.selectCity(this.cities[0]);
                            this.noticesService.info(
                                constants.NOTICES.DEFAULT_CITY_SELECTED.title,
                                constants.NOTICES.DEFAULT_CITY_SELECTED.message
                            );
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            autoDetectCity: function (coordinates) {
                return this.cities.find(city => this.coordinatesBelongToCity(coordinates, city));
            },
            getLocation: function () {
                return new Promise((resolve) => {
                    if (this.$route.query.lat && this.$route.query.lng) {
                        resolve([parseFloat(this.$route.query.lat), parseFloat(this.$route.query.lng)]);
                    } else {
                        navigator.geolocation.getCurrentPosition((position) => {
                            resolve([position.coords.latitude, position.coords.longitude]);
                        }, () => {
                            resolve(null);
                        }, {timeout: this.locationTimeout});
                    }
                });
            },
            findClosestStreet: async function (coordinates, cityId, isLocated) {
                this.searchInProgress = true;
                return this.streetsService.getStreetByCoordinates({
                    cityId: cityId,
                    coordinates: coordinates,
                    isLocated: isLocated
                }).then(response => {
                    this.searchInProgress = false;
                    return response.data;
                }).catch(() => {
                    this.searchInProgress = false;
                });
            },
            setMarker: function (coordinates, cityId, isLocated = false) {
                return new Promise(async (resolve, reject) => {
                    this.selectedStreet = null;

                    try {
                        const street = await this.findClosestStreet(coordinates, cityId, isLocated);
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
            },
            setSelectedStreet(street, coordinates) {
                this.selectedStreet = street;
                this.setCoordinates(coordinates);
                this.drawStreet(street);
                this.setStreetMarker(coordinates, street);
            },
            drawStreet(street) {
                street.ways.forEach(way => {
                    this.polyLines.push(this.drawPolyline(way));
                });
            },
            setMapView(coordinates) {
                const currentZoom = this.map.getZoom();
                this.map.setView(new L.LatLng(coordinates[0], coordinates[1]), currentZoom > this.focusZoom ? currentZoom : this.focusZoom);
            },
            /**
             * Sets new coordinates if they have changed
             * @param coordinates
             */
            setCoordinates(coordinates) {
                const newCoordinates = coordinates.length ? this.formatCoordinates(coordinates) : [];
                if (this.coordinatesChanged(newCoordinates, this.coordinates)) {
                    this.coordinates = newCoordinates;
                }
            },
            formatCoordinates(coordinates) {
                return coordinates.map(c => parseFloat(parseFloat(c).toFixed(appConfig.coordinatesPrecision)));
            },
            coordinatesChanged(newCoordinates, oldCoordinates) {
                if (!newCoordinates.length && !oldCoordinates.length) {
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
                        let marker = this.makeNamedEntityMarker(
                            coordinates,
                            namedEntities[i],
                            namedEntities.length > 1 ? {"margin-left": `-${i * 50}px`} : null);

                        if (i === 0) {
                            this.bindPopup(street, marker);
                        }

                        this.addImageMarkerToMap(marker);
                        this.markers.push(marker);
                    }
                } else {
                    let marker = this.makeStreetMarker(coordinates, street);
                    this.addImageMarkerToMap(marker);
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
                let marker = this.renderImageMarker({
                    coordinates: coordinates,
                    imageProps: {
                        imageUrl: this.streetMarkerImage,
                        title: street.name,
                        styles: null
                    }
                });

                this.bindPopup(street, marker);
                return marker;
            },
            bindPopup: function (street, marker) {
                let popupContent = `<b>${street.name}</b>`;
                if (street.oldName) {
                    popupContent += `<br/><span>(${this.constants.oldStreetNameCaption.toLowerCase()}: ${street.oldName})</span>`;
                }

                marker.bindPopup(popupContent, {offset: L.point(7, -15)});
            },
            addImageMarkerToMap: function (marker) {
                marker.on("click", (event) => {
                    event.target.closePopup();
                    this.sidebar.toggle();
                }).addTo(this.map);

                if (!this.sidebar.isOpen && !this.sidebar.isSidebarFooterShown()) {
                    marker.openPopup()
                }
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
                this.$store.commit(`cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`, city);
            },
            focusOnCity(city) {
                this.selectedStreet = null;

                try {
                    this.clearMap();

                    const bounds = optional(() => [city.bounds[0][0], city.bounds[0][2]], []);
                    this.map.setMaxBounds(bounds);
                    this.map.setView(new L.LatLng(city.coordinates[0], city.coordinates[1]), this.zoom);
                    this.$router.replace({query: {cityId: city.id, lat: undefined, lng: undefined}});
                } catch (error) {
                    // doing this to escape the error
                }
            },
            onSearchStreet: function (streetName) {
                return new Promise(async (resolve, reject) => {
                    if (!streetName) {
                        reject();
                    }

                    try {
                        const response = await this.streetsService.search({cityId: this.cityId, search: streetName})
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
                        resolve(street);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            renderImageMarker({coordinates, imageProps, className} = {}) {
                const icon = L.divIcon({html: provideImageMarkerHtml(imageProps), className: className});
                return L.marker(coordinates, {icon, riseOnHover: true});
            },
            /**
             * Map location success handler
             * Sets marker if coordinates have changed and belong to the selected city.
             * If coordinates don't belong to the selected city, tries to identify the new city.
             * If it finds the new city, then selects it and sets the coordinates.
             * Otherwise - shows notice that city is not supported.
             * @param event
             */
            onLocationSuccess(event) {
                const newCoordinates = this.formatCoordinates([event.latitude, event.longitude]);
                const coordinatesChanged = this.coordinatesChanged(newCoordinates, this.coordinates);
                const coordinatesBelongToCity = this.selectedCity ?
                    this.coordinatesBelongToCity(newCoordinates, this.selectedCity) : false;

                if (coordinatesChanged && coordinatesBelongToCity) {
                    this.coordinates = newCoordinates;
                    this.setMarker(this.coordinates, this.cityId, true);
                } else if (!coordinatesBelongToCity || !this.selectedCity) {
                    const newCity = this.autoDetectCity(newCoordinates);
                    if (newCity) {
                        this.selectCity(newCity);
                        this.coordinates = newCoordinates;
                        this.setMarker(this.coordinates, newCity.id, true);
                    } else {
                        this.noticesService.info(
                            constants.NOTICES.CITY_NOT_SUPPORTED.title,
                            constants.NOTICES.CITY_NOT_SUPPORTED.message
                        );
                    }
                }
            },
            onLocationError() {
                this.noticesService.warning(
                    constants.NOTICES.FAILED_TO_GET_LOCATION.title,
                    constants.NOTICES.FAILED_TO_GET_LOCATION.message
                )
            },
            coordinatesBelongToCity(coordinates, city) {
                let bottomLeft = city.bounds[0][0];
                let topRight = city.bounds[0][2];

                const bounds = L.bounds(L.point(bottomLeft[0], bottomLeft[1]), L.point(topRight[0], topRight[1]));
                return bounds.contains(L.point(coordinates));
            }
        }
    }
</script>