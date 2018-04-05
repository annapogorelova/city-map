<template>
    <div class="row">
        <div class="col-12">
            <h5 v-for="city in cities">
                <span class="badge badge-primary" v-on:click="selectCity(city)">{{city.name}}</span>
            </h5>
        </div>
    </div>
</template>
<style scoped>
    h5 {
        display: inline-block;
    }

    span.badge {
        margin-right: 5px;
        cursor: pointer;
    }
</style>
<script>
    import {cityService} from "../../services";

    export default {
        props: {
            selectedCityId: {
                type: Number,
                default: undefined
            }
        },
        data: function () {
            return {
                selectedCity: undefined,
                cities: []
            };
        },
        created: function () {
            this.loadCities();
        },
        watch: {
            selectedCityId: function(cityId) {
                if(!isNaN(cityId)) {
                    const city = this.cities.filter(c => c.id === cityId)[0];
                    this.selectCity(city);
                }
            }
        },
        methods: {
            loadCities() {
                cityService.getCities().then(data => {
                    this.cities = data;
                    this.preselectCity();
                });
            },
            preselectCity() {
                if(this.selectedCityId) {
                    const city = this.cities.filter(c => c.id === this.selectedCityId)[0];
                    this.selectCity(city);
                }
            },
            selectCity(city) {
                if(city) {
                    this.selectedCity = city;
                    this.$emit("citySelected", this.selectedCity);
                }
            }
        }
    }
</script>