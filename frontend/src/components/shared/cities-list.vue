<template>
    <div class="row">
        <div class="col-12">
            <button v-for="city in cities" type="button" class="btn btn-info"
                    v-on:click="selectCity(city)">
                {{city.name}}
            </button>
        </div>
    </div>
</template>
<style scoped>
    button {
        margin-right: 10px;
    }
</style>
<script>
    import {cityService} from "../../services/index";

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
                cityService.getCities().then(response => {
                    this.cities = response.data;
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