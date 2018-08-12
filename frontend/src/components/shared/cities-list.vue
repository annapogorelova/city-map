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
    import {mapState} from "vuex";
    import mutationTypes from "../../store/mutation-types";

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
        computed: {
            ...mapState({
                selectedCity: state => state.cities.selectedCity,
                cities: state => state.cities.cities
            })
        },
        created: function () {
            this.$store.subscribe((mutation) => {
                if (mutation.type === `cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`) {
                    this.selectCity(mutation.payload);
                }
            });

            this.citiesService.getCities({limit: appConfig.defaultCitiesCount}).then(response => {
                this.$store.commit(`cities/${mutationTypes.CITIES.SET_CITIES}`, response.data);
            });
        },
        methods: {
            isCitySelected: function (city) {
                return optional(() => this.selectedCity.id === city.id);
            },
            selectCity: function (city) {
                if(city && !this.isCitySelected(city)) {
                    this.$store.commit(`cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`, city);
                }
            }
        }
    }
</script>