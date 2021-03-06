<template>
    <div class="row page-wrapper">
        <div class="col-12">
            <div class="row search-container">
                <div class="col-12">
                    <search ref="search" v-on:search="onSearch"></search>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <table class="table">
                        <thead>
                            <th class="col-5">Img</th>
                            <th class="col-20">Назва</th>
                            <th class="col-25">Назва на честь</th>
                            <th class="col-20">Опис</th>
                            <th class="col-10">Оновлено</th>
                            <th class="col-10"></th>
                        </thead>
                        <tbody>
                            <tr v-for="street in streets">
                                <td class="col-5">
                                    <div class="street-image"
                                         v-for="namedEntity in street.namedEntities"
                                         v-if="street.namedEntities.length"
                                         :style="{
                                                    'background-image': 'url(' + namedEntity.imageUrl + ')',
                                                    'background-color': 'lightgrey'}"></div>
                                    <div class="street-image" v-if="!street.namedEntities.length"></div>
                                </td>
                                <td class="col-20">{{street.name}}</td>
                                <td class="col-25">{{street.namedEntities.length ? street.namedEntities.map(n => n.name).join(', ') : ''}}</td>
                                <td class="col-20">
                                    <span v-if="street.description">{{street.description}}</span>
                                </td>
                                <td class="col-10">{{street.updatedAt | formatDate}}</td>
                                <td class="col-10">
                                    <button class="btn btn-outline-success btn-sm float-right fa fa-edit"
                                            v-on:click="edit(street)">
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!streets.length">
                                <td class="no-records" colspan="6">Жодної вулиці не знайдено</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="pager-container">
                        <pager v-show="streets.length"
                               ref="pager"
                               :limit="pageLimit"
                               :count="streetsCount"
                               v-on:paginate="getStreets"></pager>
                    </div>
                </div>
            </div>
        </div>
        <bootstrap-modal ref="modal" :id="'editModal'" v-if="selectedStreet" v-on:modalHidden="selectedStreet = undefined">
            <template slot="header">
                <h4 class="mb-0">Редагувати {{selectedStreet.name}}</h4>
            </template>
            <template slot="body">
                <form>
                    <div class="form-group">
                        <label for="named-entity-name" class="col-form-label">Назва:</label>
                        <input type="text" class="form-control" id="named-entity-name"
                               v-model="selectedStreet.name">
                    </div>
                    <div class="form-group">
                        <label for="named-entity-description" class="col-form-label">Опис:</label>
                        <textarea class="form-control" id="named-entity-description"
                                  v-model="selectedStreet.description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="street-wiki-url" class="col-form-label">Url сторінки на Wiki:</label>
                        <input type="text" class="form-control" id="street-wiki-url"
                               v-model="selectedStreet.wikiUrl">
                        <a class="street-wiki-link" v-if="selectedStreet.wikiUrl" target="_blank"
                           :href="selectedStreet.wikiUrl">
                            {{selectedStreet.name}} на Wiki
                        </a>
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">Названо на честь:</label>
                        <autocomplete v-bind:apiUrl="'/namedEntities'"
                                      v-bind:clear-after-select="true"
                                      v-on:selected="addNamedEntity"></autocomplete>
                        <div class="added-named-entity-container" v-for="namedEntity in selectedStreet.namedEntities">
                            <div class="street-image named-entity-image"
                                 :style="{'background-image': 'url(' + namedEntity.imageUrl + ')',
                                          'background-color': 'lightgrey'}"></div>
                            <span class="named-entity-name">{{namedEntity.name}}</span>
                            <button type="button" class="btn btn-sm btn-outline-danger float-right" title="Видалити"
                                    v-on:click="removeNamedEntity(namedEntity)">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-outline-info" data-dismiss="modal">Закрити</button>
                <button type="button" class="btn btn-outline-success" v-on:click="save">Зберегти</button>
            </template>
        </bootstrap-modal>
    </div>
</template>
<script>
    import Vue from "vue";
    import CitiesList from "../shared/cities-list";
    import Pager from "../shared/pager";
    import Search from "../shared/search";
    import BootstrapModal from "../shared/bootstrap-modal";
    import {StreetsServiceMixin, NoticesServiceMixin, EventBusMixin} from "../../mixins/index";
    import Autocomplete from "../shared/autocomplete";
    import {optional} from "tooleks";
    import constants from "../../constants";
    import {mapState} from "vuex";
    import mutationTypes from "../../store/mutation-types";

    export default {
        components: {Autocomplete, Search, CitiesList, Pager, BootstrapModal},
        mixins: [StreetsServiceMixin, NoticesServiceMixin, EventBusMixin],
        props: {
            pageLimit: {
                type: Number,
                default: 10
            }
        },
        data: function () {
            return {
                streets: [],
                streetsCount: 0,
                selectedStreet: undefined
            }
        },
        computed: {
            ...mapState({
                selectedCity: state => state.cities.selectedCity,
                cities: state => state.cities.cities
            }),
            cityId() {
                return optional(() => this.selectedCity.id);
            },
            pager() {
                return this.$refs.pager;
            },
            modal() {
                return this.$refs.modal;
            },
            search: function () {
                return this.$refs.search;
            }
        },
        mounted: function () {
            this.$store.subscribe((mutation) => {
                if(mutation.type === `cities/${mutationTypes.CITIES.SET_CITIES}` && !this.selectedCity) {
                    const city = this.cities[0];
                    this.$store.commit(`cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`, city);
                    this.$router.push({query: {cityId: city.id}});
                    this.pager.goToPage(1);
                } else if(mutation.type === `cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`) {
                    this.$router.push({query: {cityId: mutation.payload.id}});
                    this.pager.goToPage(1);
                }
            });

            if (!isNaN(this.$route.query.cityId)) {
                const cityId = parseInt(this.$route.query.cityId);
                if(!this.selectedCity || this.selectedCity.id !== cityId) {
                    const city = this.cities.find(city => city.id === cityId);
                    this.$store.commit(`cities/${mutationTypes.CITIES.SET_SELECTED_CITY}`, city);
                }
            }

            this.preloadData();
        },
        methods: {
            preloadData() {
                this.getStreets({offset: this.pager.getOffset(), limit: this.pageLimit});
            },
            getStreets({offset, limit, search = null}) {
                return this.streetsService.search({cityId: this.cityId, search: search, offset: offset, limit: limit})
                    .then(response => {
                        this.streets = response.data;
                        this.streetsCount = response.count;
                        return response;
                    });
            },
            onSearch(text) {
                this.pager.currentPage = 1;
                this.getStreets({offset: 0, limit: this.pager.limit, search: text}).then(response => {
                    if(optional(() => response.data.length)) {
                        this.search.clear();
                    }
                });
            },
            edit(street) {
                if (!street) {
                    return;
                }

                this.selectedStreet = {...street};

                Vue.nextTick(() => {
                    this.modal.show();
                });
            },
            save() {
                let streetIndex = this.streets.findIndex(street => street.id === this.selectedStreet.id);
                this.streets[streetIndex] = this.selectedStreet;

                this.streetsService.update(this.selectedStreet).then(() => {
                    this.modal.hide();
                    this.noticesService.success(
                        constants.NOTICES.UPDATE_ACTION_SUCCESS.title,
                        constants.NOTICES.UPDATE_ACTION_SUCCESS.message
                    );

                    Vue.nextTick(() => {
                        this.selectedStreet = undefined;
                    });
                });
            },
            addNamedEntity(namedEntity) {
                if(this.selectedStreet && !this.hasNamedEntity(namedEntity)) {
                    if(!optional(() => this.selectedStreet.namedEntities.length)) {
                        this.selectedStreet.namedEntities = [];
                    }

                    this.selectedStreet.namedEntities.push(namedEntity);
                }
            },
            removeNamedEntity(namedEntity) {
                if(this.selectedStreet) {
                    this.selectedStreet.namedEntities = this.selectedStreet.namedEntities.filter(ne => ne.id !== namedEntity.id);
                }
            },
            hasNamedEntity(namedEntity) {
                return optional(() => this.selectedStreet.namedEntities.some(n => n.id === namedEntity.id));
            }
        }
    }
</script>
<style scoped>
    table {
        table-layout: fixed;
    }

    td {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .street-image {
        height: 30px;
        width: 30px;
        border-radius: 200%;
        background-position: center;
        background-size: contain;
        display: inline-block;
        margin-right: 5px;
    }

    .search-container {
        margin-top: 15px;
    }

    .no-records {
        text-align: center;
    }

    .pager-container {
        float: right;
    }

    a.street-wiki-link {
        margin-top: 8px;
        display: block;
    }

    .added-named-entity-container {
        padding-top: 10px;
    }

    .named-entity-image, .named-entity-name {
        vertical-align: middle;
    }

    textarea {
        height: 120px;
    }
</style>