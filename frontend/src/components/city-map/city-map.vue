<template>
    <div class="row">
        <div class="col-12">
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
    import {streetService} from "../../services";
    import {optional} from "tooleks";

    export default {
        components: {BasicMap},

        data: function () {
            return {
                search: undefined,
                marker: undefined,
                polyLines: []
            }
        },
        computed: {
            map: function () {
                return this.$refs.map.getMap();
            },
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
                    if(street) {
                        if(this.polyLines) {
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