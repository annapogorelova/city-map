<template>
    <div class="row page-wrapper">
        <div class="col-12">
            <div class="row">
                <div class="col-12 col-xxl-9">
                    <div class="map-wrapper">
                        <basic-map ref="map" v-on:init="onMapInit" :zoom="zoom"></basic-map>
                    </div>
                </div>
                <div class="col-12 col-xxl-3">
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
<style scoped>
    .page-wrapper {
        overflow-x: hidden;
    }

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

    .leaflet-div-icon {
        background: none;
        border: none;
    }

    .default-image-marker .image-marker {
        border: 1px solid #000000;
        background-color: #e5e5e5;
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

    export default {
        components: {BasicMap, CitiesList, StreetDescription, Search},
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
                coordinates: undefined
            }
        },
        watch: {
            '$route.query.cityId': function(cityId) {
                console.log('$route.query.cityId');
                if (!isNaN(cityId) && optional(() => this.city.id !== cityId)) {
                    this.citiesService.getCity(cityId).then(response => {
                        this.selectCity(response.data);
                    });
                }
            },
            city: function (city) {
                if(city && this.map) {
                    const bounds = optional(() =>[city.bounds[0][0], city.bounds[0][2]]);
                    this.map.setMaxBounds(bounds);
                } else {
                    this.map.setMaxBounds([]);
                }
            }
        },
        computed: {
            map: function () {
                return this.$refs.map.getMap();
            },
            defaultImage: function () {
                return require("../../../assets/images/default-image.png");
            },
            cityId: function () {
                if(this.city) {
                    return this.city.id;
                } else if(!isNaN(this.$route.query.cityId)) {
                    return this.$route.query.cityId;
                }

                return null;
            }
        },
        created: function () {
            this.searchEventOff = this.eventBus.on("search", (search) => {
                this.onSearchStreet(search);
            });

            this.citySelectOff = this.eventBus.on("city-selected", (city) => {
                console.log("city-selected");
                this.selectCity(city);
            });
        },
        mounted: function () {
            this.getLocation().then(coordinates => {
                if(coordinates.length) {
                    console.log("getLocation");
                    this.coordinates = coordinates;
                    this.$router.push({query: {...this.$route.query, coordinates: coordinates}});
                    this.map.setView(this.coordinates, this.focusZoom);
                    this.setMarker(this.coordinates);
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
                                "Не вдалось отримати ваші координати",
                                "Перевірте налаштування вашого браузера та спробуйте знову.");
                            reject();
                        }, {timeout: 3000});
                    });
                }
            },
            findClosestStreet: function (coordinates) {
                if(!this.cityId) {
                    return Promise.reject();
                }

                return this.streetsService.getStreetByCoordinates({
                    cityId: this.cityId,
                    coordinates: coordinates
                }).then(response => {
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
                        marker.bindPopup("<b>Це не вулиця</b><br>Оберіть будь ласка інші координати.").openPopup();
                    }
                });
            },
            setSelectedStreet(street, coordinates) {
                this.selectedStreet = null;

                Vue.nextTick(() => {
                    this.clearMap();

                    this.selectedStreet = street;
                    this.coordinates = coordinates;
                    this.$router.push({query: {...this.$route.query, coordinates: coordinates}});

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
                const mapZoom = this.map.getZoom();
                const zoom = mapZoom > this.focusZoom ? mapZoom : this.focusZoom;
                this.map.setView(coordinates, zoom);
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
                                title: namedEntities[i].name,
                                linkUrl: namedEntities[i].wikiUrl,
                                styles: namedEntities.length > 1 ? {"margin-left": `-${i * 50}px`} : null
                            },
                            className: namedEntities[i].imageUrl ? "" : "default-image-marker"
                        }));
                    }

                    this.markers.map(m => m.addTo(this.map));
                } else {
                    this.addMarker({coordinates: coordinates});
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
                this.coordinates = [];
                this.$router.push({query: {...this.$route.query, coordinates: []}});

                this.clearMap();
                this.map.setView(city.coordinates, this.zoom);
            },
            onSearchStreet(streetName) {
                if(!streetName) {
                    return;
                }

                this.streetsService.search({cityId: this.city.id, search: streetName}).then(response => {
                    const street = optional(() => response.data[0], null);

                    if (street) {
                        this.setSelectedStreet(street, optional(() => street.ways[0][0], null));
                    } else {
                        this.clearMap();
                        this.selectedStreet = null;
                        this.coordinates = [];
                        this.$router.push({query: {...this.$route.query, coordinates: []}});
                        this.noticesService.info("Вулицю не знайдено", "Перевірте будь ласка назву вулиці та повторіть пошук.");
                    }
                });
            },
            renderImageMarker({coordinates, imageProps, className} = {}) {
                let icon = L.divIcon({html: provideImageMarkerHtml(imageProps), className: className});
                return L.marker(coordinates, {icon, riseOnHover: true});
            }
        }
    }
</script>