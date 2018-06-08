<template>
    <div class="row">
        <div class="col-12">
            <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                <button class="dropdown-item btn-link" :class="{'active': isCitySelected(city)}"
                        v-for="city in cities" v-on:click="selectCity(city)">
                    {{city.name}}
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
    button {
        margin-right: 10px;
        margin-bottom: 5px;
        cursor: pointer;
    }

    .btn.active {
        background-color: #138496;
        border-color: #138496;
    }
</style>
<script>
    import {optional} from "tooleks";
    import {CitiesServiceMixin} from "../../mixins/index";
    import appConfig from "../../app.config";

    export default {
        props: {
            preselectedCityId: {
                type: Number,
                default: undefined
            },
            preselectDefault: {
                type: Boolean,
                default: false
            }
        },
        mixins: [CitiesServiceMixin],
        data: function () {
            return {
                selectedCity: undefined,
                cities: []
            };
        },
        created: function () {
            this.loadCities();
        },
        methods: {
            isCitySelected: function (city) {
                return optional(() => this.selectedCity.id === city.id);
            },
            loadCities: function () {
                return this.citiesService.getCities({limit: appConfig.defaultCitiesCount}).then(response => {
                    this.cities = response.data;
                    this.preselectCity();
                });
            },
            preselectCity: function () {
                if(this.preselectedCityId) {
                    const city = this.cities.filter(c => c.id === this.preselectedCityId)[0];
                    this.selectCity(city);
                } else if (this.preselectDefault) {
                    const defaultCity = optional(() =>
                        this.cities.find(c => c.name === appConfig.defaultCityName), this.cities[0]);
                    this.selectCity(defaultCity);
                }
            },
            selectCity: function (city) {
                if(city && !this.isCitySelected(city)) {
                    this.selectedCity = city;
                    this.$emit("citySelected", this.selectedCity);
                }
            }
        }
    }
</script>