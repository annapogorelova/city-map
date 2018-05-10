<template>
    <div class="row">
        <div class="col-12">
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
                            <th>Опис</th>
                            <th class="text-right">Теги</th>
                            <th class="text-right">Оновлено</th>
                            <th class="text-right">Заблоковано</th>
                            <th></th>
                        </thead>
                        <tbody>
                            <tr v-for="namedEntity in namedEntities">
                                <td>
                                    <div class="named-entity-image"
                                         :style="{
                                                        'background-image': 'url(' + namedEntity.imageUrl + ')',
                                                        'background-color': 'lightgrey'}"></div>
                                </td>
                                <td>{{namedEntity.name}}</td>
                                <td>
                                        <span v-if="namedEntity.description">
                                            {{`${namedEntity.description.substring(0, 30)}...`}}
                                        </span>
                                </td>
                                <td class="text-right">
                                    <span v-if="namedEntity.tags.length">{{namedEntity.tags.length}}</span>
                                </td>
                                <td class="text-right">
                                    <span>{{namedEntity.updatedAt | formatDate }}</span>
                                </td>
                                <td class="text-right">
                                    {{namedEntity.isLockedForParsing ? "1" : "0"}}
                                </td>
                                <td>
                                    <button class="btn btn-outline-success btn-sm float-right fa fa-edit"
                                            v-on:click="edit(namedEntity)">
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm float-right fa fa-trash-alt"
                                            v-on:click="showRemoveConfirmation(namedEntity)">
                                    </button>
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
                               :pageNumber="pageNumber"
                               v-on:paginate="getNamedEntities"></pager>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit modal -->
        <bootstrap-modal ref="editModal" :id="'editModal'" v-if="selectedNamedEntity"
                         v-on:modalHidden="selectedNamedEntity = undefined">
            <template slot="header">
                <h4 class="mb-0">{{selectedNamedEntity.id ? "Редагувати" : "Створити персону"}}
                    <span v-if="selectedNamedEntity.name">{{selectedNamedEntity.name}}</span></h4>
            </template>
            <template slot="body">
                <form>
                    <div class="form-group">
                        <label for="named-entity-name" class="col-form-label">Назва:</label>
                        <input type="text" class="form-control" id="named-entity-name"
                               v-model="selectedNamedEntity.name">
                    </div>
                    <div class="form-group">
                        <label for="named-entity-description" class="col-form-label">Опис:</label>
                        <textarea class="form-control" id="named-entity-description"
                                  v-model="selectedNamedEntity.description"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">Теги:</label>
                        <tags-editing-widget
                                v-bind:initial-tags="selectedNamedEntity.tags.map(t => t.name)"
                                v-on:tagAdded="addTag" v-on:tagRemoved="removeTag">
                        </tags-editing-widget>
                    </div>
                    <div class="form-group">
                        <label for="named-entity-image-url" class="col-form-label">Url зображення:</label>
                        <input type="text" class="form-control" id="named-entity-image-url"
                               v-model="selectedNamedEntity.imageUrl">
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">Зображення:</label>
                        <div class="named-entity-image edited-image"
                             :style="{'background-image': 'url(' + selectedNamedEntity.imageUrl + ')',
                                      'background-color': 'lightgrey'}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-form-label">Заблоковано:</label>
                        <input type="checkbox" class="form-control-lg"
                               v-model="selectedNamedEntity.isLockedForParsing"/>
                    </div>
                    <div class="form-group">
                        <label for="named-entity-wiki-url" class="col-form-label">Url сторінки на Wiki:</label>
                        <input type="text" class="form-control" id="named-entity-wiki-url"
                               v-model="selectedNamedEntity.wikiUrl">
                    </div>
                </form>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-outline-info" data-dismiss="modal">Закрити</button>
                <button v-if="selectedNamedEntity.id" type="button" class="btn btn-outline-success"
                         v-on:click="save">Зберегти</button>
                <button v-if="!selectedNamedEntity.id" type="button" class="btn btn-outline-success"
                         v-on:click="create">Створити</button>
            </template>
        </bootstrap-modal>
        <!--/ Edit modal -->

        <!-- Remove confirmation modal -->
        <bootstrap-modal ref="removeConfirmationModal" :id="'removeConfirmationModal'" v-if="selectedNamedEntity">
            <template slot="header">
                <h4 class="mb-0">Видалення {{selectedNamedEntity.name}}</h4>
            </template>
            <template slot="body">
                <p>Ви дійсно бажаєте видалити <b>{{selectedNamedEntity.name}}?</b></p>
                <p>Запис буде повністю видалено із бази даних. Вулиці, що мали зв'язок до цього запису, втратять його.</p>
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
                pageNumber: 1,
                selectedNamedEntity: undefined
            }
        },
        computed: {
            pager() {
                return this.$refs.pager;
            },
            editModal() {
                return this.$refs.editModal;
            },
            removeConfirmationModal() {
                return this.$refs.removeConfirmationModal;
            }
        },
        mounted: function () {
            if (!isNaN(this.$route.query.page)) {
                this.pageNumber = parseInt(this.$route.query.page);
            }

            this.getNamedEntities({offset: this.pager.offset, limit: this.pager.limit});
        },
        methods: {
            getNamedEntities({offset, limit, search = null}) {
                this.namedEntitiesService.search({search: search, offset: offset, limit: limit})
                    .then(response => {
                        this.namedEntities = response.data;
                        this.namedEntitiesCount = response.count;
                    });
            },
            search(text) {
                this.pager.currentPage = 1;
                this.getNamedEntities({offset: 0, limit: this.pager.limit, search: text});
            },
            edit(namedEntity) {
                if (!namedEntity) {
                    return;
                }

                this.selectedNamedEntity = JSON.parse(JSON.stringify(namedEntity));
                if(!this.selectedNamedEntity.tags) {
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
                    this.noticesService.success("Дію успішно виконано", `${this.selectedNamedEntity.name} оновлено`);

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
                    this.noticesService.success("Дію успішно виконано", `${this.selectedNamedEntity.name} видалено`);

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
                    this.namedEntities.splice(0, 0, this.selectedNamedEntity);

                    this.editModal.hide();
                    this.noticesService.success("Дію успішно виконано", `${this.selectedNamedEntity.name} створено`);

                    Vue.nextTick(() => {
                        this.selectedNamedEntity = undefined;
                    });
                });
            },
            addTag(event) {
                if(this.selectedNamedEntity) {
                    this.selectedNamedEntity.tags.push({name: event.tag});
                }
            },
            removeTag(event) {
                if(this.selectedNamedEntity) {
                    const tagIndex = this.selectedNamedEntity.tags.findIndex(t => t.name === event.tag);
                    this.selectedNamedEntity.tags.splice(tagIndex, 1);
                }
            }
        }
    }
</script>
<style>
    table {
        margin-top: 15px;
        margin-bottom: 10px !important;
    }

    .table td {
        vertical-align: middle;
        padding: 8px;
    }

    .named-entity-image {
        height: 30px;
        width: 30px;
        border-radius: 200%;
        background-position: center;
        background-size: contain;
    }

    .edited-image {
        height: 60px;
        width: 60px;
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
        margin-bottom: 5px;
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
</style>