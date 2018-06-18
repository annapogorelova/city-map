<template>
    <div>
        <div :id="id" class="map" :style="{height: height + 'px'}"></div>
        <a class="location-control" title="Знайти мене" aria-label="Знайти мене" v-on:click="locate"><i
                class="fa fa-compass"></i></a>
    </div>
</template>

<style>
    .map {
        width: 100%;
        cursor: default;
        position: relative;
    }

    .location-control {
        position: absolute;
        top: 80px;
        left: 10px;
        z-index: 9999;
        background-color: #ffffff;
        width: 34px;
        height: 34px;
        line-height: 34px;
        text-align: center;
        cursor: pointer;
        border-radius: 4px;
        border: 2px solid rgba(0, 0, 0, 0.2);
        background-clip: padding-box;
    }
</style>

<script>
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    export default {
        props: {
            tileLayerOptions: {
                type: Object,
                default: () => {
                    return {
                        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
                        minZoom: 1,
                        maxZoom: 19
                    };
                },
            },
            tileLayerUrl: {
                type: String,
                default: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png",
            },
            lat: {
                type: Number,
                default: 49.85
            },
            lng: {
                type: Number,
                default: 24.0166666667
            },
            zoom: {
                type: Number,
                default: 8,
            },
            bounds: {
                type: Array,
                default: () => []
            },
            locationTimeout: {
                type: Number,
                default: 10000
            },
            id: {
                type: String,
                default: () => {
                    const id = Math.random().toString(36).substr(2, 5);
                    return `map-${id}`;
                },
            },
            height: {
                type: Number
            }
        },
        data: () => {
            return {
                map: undefined,
            };
        },
        mounted: function () {
            this.init();
        },
        beforeDestroy: function () {
            this.destroy();
        },
        methods: {
            destroy: function () {
                this.map.remove();
            },
            getMap() {
                return this.map;
            },
            init() {
                this.map = L.map(this.id).setView([this.lat, this.lng], this.zoom);
                if (this.bounds && this.bounds.length) {
                    this.map.setMaxBounds(this.bounds);
                }
                L.tileLayer(this.tileLayerUrl, this.tileLayerOptions).addTo(this.map);
                this.$emit("init");
            },
            setCenter(lat, lng, zoom = null) {
                this.map.setView(new L.LatLng(lat, lng), zoom || this.zoom);
            },
            locate() {
                this.map.locate({setView: true, timeout: this.locationTimeout})
                    .on("locationfound", (event) => {
                        this.$emit("locationsuccess", event);
                    })
                    .on("locationerror", (error) => {
                        this.$emit("locationerror", error);
                    });
            }
        }
    }
</script>