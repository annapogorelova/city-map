<template>
    <div :id="this.id" class="map"></div>
</template>

<style>
    .map {
        height: 500px;
        width: 100%;
        margin-top: 15px;
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
                        maxZoom: 18,
                        attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`,
                    };
                },
            },
            tileLayerUrl: {
                type: String,
                default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
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
            id: {
                type: String,
                default: () => {
                    const id = Math.random().toString(36).substr(2, 5);
                    return `map-${id}`;
                },
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
                L.tileLayer(this.tileLayerUrl, this.tileLayerOptions).addTo(this.map);
                this.$emit("init");
            },
            setCenter(lat, lon, zoom = null) {
                this.map.setView(new L.LatLng(lat, lon), zoom || this.zoom);
            }
        }
    }
</script>