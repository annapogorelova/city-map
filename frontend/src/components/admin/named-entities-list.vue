<template>
    <div class="row page-wrapper">
        <div class="col-12">
            <div class="row search-container">
                <div class="col-12">
                    <search ref="search" v-on:search="onSearch" v-bind:placeholder="'Назва персони'"></search>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <table class="table">
                        <thead>
                            <th class="col-5">Img</th>
                            <th class="col-40">Назва</th>
                            <th class="col-25">Опис</th>
                            <th class="text-right col-5">Теги</th>
                            <th class="text-right col-10">Оновлено</th>
                            <th class="text-right col-5">Заблоковано</th>
                            <th class="col-10"></th>
                        </thead>
                        <tbody>
                            <tr v-for="namedEntity in namedEntities">
                                <td class="col-5">
                                    <div class="named-entity-image"
                                         :style="{'background-image':
                                         'url(' + (namedEntity.imageUrl ? namedEntity.imageUrl : defaultImage) + ')'}"></div>
                                </td>
                                <td class="col-40">{{namedEntity.name}}</td>
                                <td class="col-25">
                                    <span v-if="namedEntity.description">
                                        {{namedEntity.description}}
                                    </span>
                                </td>
                                <td class="text-right col-5">
                                    <span v-if="namedEntity.tags.length">{{namedEntity.tags.length}}</span>
                                </td>
                                <td class="text-right col-10">
                                    <span>{{namedEntity.updatedAt | formatDate }}</span>
                                </td>
                                <td class="text-right col-5">
                                    {{namedEntity.isLockedForParsing ? "1" : "0"}}
                                </td>
                                <td class="col-10">
                                    <button v-if="namedEntity.id" class="btn btn-outline-success btn-sm float-right fa fa-edit"
                                            v-on:click="edit(namedEntity)">
                                    </button>
                                    <button v-if="namedEntity.id" class="btn btn-outline-danger btn-sm float-right fa fa-trash-alt"
                                            v-on:click="showRemoveConfirmation(namedEntity)">
                                    </button>
                                    <span v-if="!namedEntity.id">Щойно додано</span>
                                </td>
                            </tr>
                            <tr v-if="!namedEntities.length">
                                <td class="no-records" colspan="6">Жодного запису не знайдено</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="row create-btn-container">
                <div class="col-1 offset-11">
                    <button class="btn btn-outline-primary float-right" v-on:click="addNamedEntity">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="pager-container">
                        <pager v-show="namedEntities.length"
                               ref="pager"
                               :limit="pageLimit"
                               :count="namedEntitiesCount"
                               v-on:paginate="getNamedEntities"
                               v-on:init="preloadData"></pager>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit modal -->
        <bootstrap-modal ref="editModal" :id="'editModal'" v-if="selectedNamedEntity"
                         :label="'Edit Named Entity Modal'"
                         v-on:modalHidden="selectedNamedEntity = undefined">
            <template slot="header">
                <h4 class="mb-0">{{selectedNamedEntity.id ? "Редагувати" : "Створити персону"}}
                    <span v-if="selectedNamedEntity.name">{{selectedNamedEntity.name}}</span></h4>
            </template>
            <template slot="body">
                <form>
                    <div class="row">
                        <div class="col-12 col-lg-6">
                            <div class="form-group">
                                <label for="named-entity-name" class="col-form-label">Назва:</label>
                                <input type="text" class="form-control" id="named-entity-name"
                                       v-model="selectedNamedEntity.name">
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="form-group">
                                <label for="named-entity-wiki-url" class="col-form-label">Url сторінки на Wiki:</label>
                                <input type="text" class="form-control" id="named-entity-wiki-url"
                                       v-model="selectedNamedEntity.wikiUrl">
                                <a class="named-entity-wiki-link" v-if="selectedNamedEntity.wikiUrl" target="_blank"
                                   :href="selectedNamedEntity.wikiUrl">
                                    {{selectedNamedEntity.name}} на Wiki
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div class="form-group">
                                <label for="named-entity-description" class="col-form-label">Опис:</label>
                                <textarea class="form-control" id="named-entity-description"
                                          v-model="selectedNamedEntity.description"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 col-lg-6">
                            <div class="form-group">
                                <label class="col-form-label">Зображення:</label>
                                <input type="text" class="form-control" id="named-entity-image-url"
                                       v-model="selectedNamedEntity.imageUrl">
                                <div class="named-entity-image edited-image"
                                     :style="{'background-image': 'url(' + selectedNamedEntity.imageUrl + ')'}">
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="form-group">
                                <label class="col-form-label">Теги:</label>
                                <tags-editing-widget
                                        v-bind:initial-tags="selectedNamedEntity.tags.map(t => t.name)"
                                        v-on:tagAdded="addTag" v-on:tagRemoved="removeTag">
                                </tags-editing-widget>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div class="form-group">
                                <label class="col-form-label">Запис заблоковано:</label>
                                <input type="checkbox" class="form-control-lg"
                                       v-model="selectedNamedEntity.isLockedForParsing"/>
                            </div>
                        </div>
                    </div>
                </form>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-outline-info" data-dismiss="modal">Закрити</button>
                <button v-if="selectedNamedEntity.id" type="button" class="btn btn-outline-success"
                        v-on:click="save">Зберегти
                </button>
                <button v-if="!selectedNamedEntity.id" type="button" class="btn btn-outline-success"
                        v-on:click="create">Створити
                </button>
            </template>
        </bootstrap-modal>
        <!--/ Edit modal -->

        <!-- Remove confirmation modal -->
        <bootstrap-modal ref="removeConfirmationModal" :id="'removeConfirmationModal'" v-if="selectedNamedEntity"
                         :label="'Remove Named Entity Modal'">
            <template slot="header">
                <h4 class="mb-0">Видалення {{selectedNamedEntity.name}}</h4>
            </template>
            <template slot="body">
                <p>Ви дійсно бажаєте видалити <b>{{selectedNamedEntity.name}}?</b></p>
                <p>Запис буде повністю видалено із бази даних. Вулиці, що мали зв'язок до цього запису, втратять
                    його.</p>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-outline-info" data-dismiss="modal">Ні</button>
                <button type="button" class="btn btn-outline-success" v-on:click="remove">Так</button>
            </template>
        </bootstrap-modal>
        <!--/ Remove confirmation modal -->
    </div>
</template>
<script>
    import Vue from "vue";
    import Pager from "../shared/pager";
    import Search from "../shared/search";
    import BootstrapModal from "../shared/bootstrap-modal";
    import {NamedEntitiesServiceMixin, NoticesServiceMixin} from "../../mixins/index";
    import TagsEditingWidget from "../shared/tags-editing-widget";
    import moment from "moment";
    import constants from "../../constants";
    import {optional} from "tooleks";

    export default {
        components: {TagsEditingWidget, Search, Pager, BootstrapModal},
        mixins: [NamedEntitiesServiceMixin, NoticesServiceMixin],
        props: {
            pageLimit: {
                type: Number,
                default: 10
            }
        },
        data: function () {
            return {
                cityId: undefined,
                namedEntities: [],
                namedEntitiesCount: 0,
                selectedNamedEntity: undefined
            }
        },
        computed: {
            pager: function () {
                return this.$refs.pager;
            },
            search: function () {
                return this.$refs.search;
            },
            editModal: function () {
                return this.$refs.editModal;
            },
            removeConfirmationModal: function () {
                return this.$refs.removeConfirmationModal;
            },
            defaultImage: function () {
                return require("../../../static/images/default-image.png");
            }
        },
        methods: {
            preloadData() {
                this.getNamedEntities({offset: this.pager.getOffset(), limit: this.pager.limit});
            },
            getNamedEntities({offset, limit, search = null}) {
                return this.namedEntitiesService.search({search: search, offset: offset, limit: limit})
                    .then(response => {
                        this.namedEntities = response.data;
                        this.namedEntitiesCount = response.count;
                        return response;
                    });
            },
            onSearch(text) {
                this.pager.currentPage = 1;
                this.getNamedEntities({offset: 0, limit: this.pager.limit, search: text}).then(response => {
                    if(optional(() => response.data.length)) {
                        this.search.clear();
                    }
                });
            },
            edit(namedEntity) {
                if (!namedEntity) {
                    return;
                }

                this.selectedNamedEntity = JSON.parse(JSON.stringify(namedEntity));
                if (!this.selectedNamedEntity.tags) {
                    this.selectedNamedEntity.tags = [];
                }

                Vue.nextTick(() => {
                    this.editModal.show();
                });
            },
            save() {
                this.namedEntitiesService.update(this.selectedNamedEntity).then(() => {
                    let namedEntityIndex = this.namedEntities.findIndex(entity => entity.id === this.selectedNamedEntity.id);
                    this.namedEntities[namedEntityIndex] = this.selectedNamedEntity;

                    this.editModal.hide();
                    this.noticesService.success(
                        constants.NOTICES.UPDATE_ACTION_SUCCESS.title,
                        constants.NOTICES.UPDATE_ACTION_SUCCESS.message);

                    Vue.nextTick(() => {
                        this.selectedNamedEntity = undefined;
                    });
                });
            },
            showRemoveConfirmation(namedEntity) {
                this.selectedNamedEntity = namedEntity;

                Vue.nextTick(() => {
                    this.removeConfirmationModal.show();
                });
            },
            remove() {
                this.namedEntitiesService.remove(this.selectedNamedEntity.id).then(() => {
                    this.namedEntities = this.namedEntities.filter(entity => entity.id !== this.selectedNamedEntity.id);

                    this.removeConfirmationModal.hide();
                    this.noticesService.success(
                        constants.NOTICES.DELETE_ACTION_SUCCESS.title,
                        constants.NOTICES.DELETE_ACTION_SUCCESS.message
                    );

                    Vue.nextTick(() => {
                        this.selectedNamedEntity = undefined;
                    });
                });
            },
            addNamedEntity() {
                this.selectedNamedEntity = {
                    tags: []
                };

                Vue.nextTick(() => {
                    this.editModal.show();
                });
            },
            create() {
                this.namedEntitiesService.create(this.selectedNamedEntity).then(() => {
                    this.selectedNamedEntity.createdAt = moment.utc().format('YYYY-DD-MMTHH:mm:ss.000');
                    this.selectedNamedEntity.updatedAt = moment.utc().format('YYYY-DD-MMTHH:mm:ss.000');

                    this.namedEntities.splice(0, 0, this.selectedNamedEntity);

                    this.editModal.hide();
                    this.noticesService.success(
                        constants.NOTICES.CREATE_ACTION_SUCCESS.title,
                        constants.NOTICES.CREATE_ACTION_SUCCESS.message
                    );

                    Vue.nextTick(() => {
                        this.selectedNamedEntity = undefined;
                    });
                });
            },
            addTag(event) {
                if (this.selectedNamedEntity) {
                    this.selectedNamedEntity.tags.push({name: event.tag});
                }
            },
            removeTag(event) {
                if (this.selectedNamedEntity) {
                    const tagIndex = this.selectedNamedEntity.tags.findIndex(t => t.name === event.tag);
                    this.selectedNamedEntity.tags.splice(tagIndex, 1);
                }
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

    .named-entity-image {
        height: 30px;
        width: 30px;
        border-radius: 200%;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        background-color: #e5e5e5;
    }

    .edited-image {
        height: 60px;
        width: 60px;
        margin-top: 8px;
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

    textarea {
        height: 120px;
    }

    button {
        margin-right: 5px;
    }

    input[type=checkbox] {
        height: 16px;
        width: 16px;
        vertical-align: middle;
        margin-left: 5px;
    }

    .create-btn-container {
        margin-bottom: 10px;
    }

    a.named-entity-wiki-link {
        margin-top: 8px;
        display: block;
    }
</style>