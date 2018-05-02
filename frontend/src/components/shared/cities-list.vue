<template>
    <div class="row">
        <div class="col-12">
            <button v-for="city in cities" type="button" class="btn btn-info"
                    v-bind:class="{'active': isCitySelected(city)}"
                    v-on:click="selectCity(city)">
                {{city.name}}
            </button>
        </div>
    </div>
</template>
<style scoped>
    button {
        margin-right: 10px;
        margin-bottom: 5px;
    }

    .btn.active {
        background-color: #138496;
        border-color: #138496;
    }
</style>
<script>
    import {optional} from "tooleks";

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
            isCitySelected: function (city) {
                return optional(() => this.selectedCity.id === city.id);
            },
            loadCities: function () {
                this.$dc.get("cities").getCities().then(response => {
                    this.cities = response.data;
                    this.preselectCity();
                });
            },
            preselectCity: function () {
                if(this.selectedCityId) {
                    const city = this.cities.filter(c => c.id === this.selectedCityId)[0];
                    this.selectCity(city);
                }
            },
            selectCity: function (city) {
                if(city) {
                    this.selectedCity = city;
                    this.$emit("citySelected", this.selectedCity);
                }
            }
        }
    }
</script>