<template>
    <div class="row">
        <div class="col-12">
            <div class="row">
                <div class="col-12">
                    <cities-list v-bind:selected-city-id="cityId"
                                 v-on:citySelected="onCitySelected"></cities-list>
                </div>
            </div>
            <div class="row search-container">
                <div class="col-12">
                    <search v-on:search="search"></search>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <table class="table">
                        <thead>
                            <th>Img</th>
                            <th>Назва</th>
                            <th>Назва на честь</th>
                            <th>Опис</th>
                            <th>Оновлено</th>
                            <th></th>
                        </thead>
                        <tbody>
                            <tr v-for="street in streets">
                                <td>
                                    <div class="street-image"
                                         v-if="street.namedEntity"
                                         :style="{
                                                    'background-image': 'url(' + street.namedEntity.imageUrl + ')',
                                                    'background-color': 'lightgrey'}"></div>
                                    <div class="street-image" v-if="!street.namedEntity"></div>
                                </td>
                                <td>{{street.name}}</td>
                                <td>{{street.namedEntity ? street.namedEntity.name : ""}}</td>
                                <td>
                                        <span v-if="street.description">
                                        {{`${street.description.substring(0, 30)}...`}}
                                        </span>
                                </td>
                                <td>{{street.updatedAt | formatDate}}</td>
                                <td>
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
                               v-on:init="preloadData"
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
                        <autocomplete v-bind:initial-value="selectedStreet.namedEntity"
                                      v-bind:apiUrl="'/namedEntities'"
                                      v-on:selected="setNamedEntity"
                                      v-on:deselected="unsetNamedEntity"></autocomplete>
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
    import {StreetsServiceMixin, NoticesServiceMixin} from "../../mixins/index";
    import Autocomplete from "../shared/autocomplete";

    export default {
        components: {Autocomplete, Search, CitiesList, Pager, BootstrapModal},
        mixins: [StreetsServiceMixin, NoticesServiceMixin],
        props: {
            pageLimit: {
                type: Number,
                default: 10
            }
        },
        data: function () {
            return {
                cityId: undefined,
                streets: [],
                streetsCount: 0,
                selectedStreet: undefined
            }
        },
        computed: {
            pager() {
                return this.$refs.pager;
            },
            modal() {
                return this.$refs.modal;
            }
        },
        created: function () {
            if (!isNaN(this.$route.query.cityId)) {
                this.cityId = parseInt(this.$route.query.cityId);
            }
        },
        methods: {
            preloadData() {
                this.getStreets({offset: this.pager.getOffset(), limit: this.pageLimit});
            },
            getStreets({offset, limit, search = null}) {
                this.streetsService.search({cityId: this.cityId, search: search, offset: offset, limit: limit})
                    .then(response => {
                        this.streets = response.data;
                        this.streetsCount = response.count;
                    });
            },
            search(text) {
                this.pager.currentPage = 1;
                this.getStreets({offset: 0, limit: this.pager.limit, search: text});
            },
            onCitySelected(city) {
                if (city && city.id !== this.cityId) {
                    this.cityId = city.id;
                    this.$router.push({query: {...this.$route.query, cityId: this.cityId}});
                    this.pager.goToPage(1);
                }
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
                    this.noticesService.success("Дію успішно виконано", `${this.selectedStreet.name} оновлено`);

                    Vue.nextTick(() => {
                        this.selectedStreet = undefined;
                    });
                });
            },
            setNamedEntity(namedEntity) {
                if(this.selectedStreet) {
                    this.selectedStreet.namedEntityId = namedEntity.id;
                    this.selectedStreet.namedEntity = namedEntity;
                }
            },
            unsetNamedEntity() {
                if(this.selectedStreet) {
                    this.selectedStreet.namedEntityId = null;
                    this.selectedStreet.namedEntity = undefined;
                }
            }
        }
    }
</script>
<style>
    table {
        margin-top: 15px;
    }

    .table td {
        vertical-align: middle;
        padding: 8px;
    }

    .street-image {
        height: 30px;
        width: 30px;
        border-radius: 200%;
        background-position: center;
        background-size: contain;
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
</style>