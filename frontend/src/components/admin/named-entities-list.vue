<template>
    <div class="row">
        <div class="col-12">
            <div class="row search-container">
                <div class="col-12">
                    <search v-on:search="searchNamedEntities"></search>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <table class="table">
                        <thead>
                        <th>Img</th>
                        <th>Назва</th>
                        <th>Опис</th>
                        <th>Теги</th>
                        <th>Оновлено</th>
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
                                    {{`${namedEntity.description.substring(0, 60)}...`}}
                                </span>
                            </td>
                            <td>
                                <span v-if="namedEntity.tags.length">{{namedEntity.tags.length}}</span>
                            </td>
                            <td>
                                <span>{{namedEntity.updatedAt | formatDate }}</span>
                            </td>
                            <td>
                                <button class="btn float-right"
                                    v-on:click="editNamedEntity(namedEntity)">
                                    Ред.
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!namedEntities.length">
                            <td class="no-records" colspan="4">No Records</td>
                        </tr>
                        </tbody>
                    </table>
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
        <bootstrap-modal ref="modal" :id="'editModal'" v-if="selectedNamedEntity">
            <template slot="header">
                <h4 class="mb-0">Редагувати {{selectedNamedEntity.name}}</h4>
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
                        <label for="named-entity-wiki-url" class="col-form-label">Url сторінки на Wiki:</label>
                        <input type="text" class="form-control" id="named-entity-wiki-url"
                               v-model="selectedNamedEntity.wikiUrl">
                    </div>
                </form>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрити</button>
                <button type="button" class="btn btn-primary" v-on:click="saveNamedEntity">Зберегти</button>
            </template>
        </bootstrap-modal>
    </div>
</template>
<script>
    import Vue from "vue";
    import Pager from "../shared/pager";
    import Search from "../shared/search";
    import BootstrapModal from "../shared/bootstrap-modal";

    export default {
        components: {Search, Pager, BootstrapModal},
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
            modal() {
                return this.$refs.modal;
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
                this.$dc.get("namedEntities").search({search: search, offset: offset, limit: limit})
                    .then(response => {
                        this.namedEntities = response.data;
                        this.namedEntitiesCount = response.count;
                    });
            },
            searchNamedEntities(search) {
                this.pager.currentPage = 1;
                this.getNamedEntities({offset: 0, limit: this.pager.limit, search: search});
            },
            editNamedEntity(namedEntity) {
                if(!namedEntity) {
                    return;
                }

                this.selectedNamedEntity = {...namedEntity};

                Vue.nextTick(() => {
                   this.modal.show();
                });
            },
            saveNamedEntity() {
                let namedEntityIndex = this.namedEntities.findIndex(entity => entity.id === this.selectedNamedEntity.id);
                this.namedEntities[namedEntityIndex] = this.selectedNamedEntity;

                this.$dc.get("namedEntities").update(this.selectedNamedEntity).then(() => {
                    this.modal.hide();
                    this.$dc.get("notices").success("Дію успішно виконано", `${this.selectedNamedEntity.name} оновлено`);

                    Vue.nextTick(() => {
                        this.selectedNamedEntity = undefined;
                    });
                });
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
</style>