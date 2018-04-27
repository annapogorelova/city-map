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
                                <button class="btn float-right">Ред.</button>
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
    </div>
</template>
<script>
    import Pager from "../shared/pager";
    import {namedEntityService} from "../../services";
    import Search from "../shared/search";

    export default {
        components: {Search, Pager},
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
                pageNumber: 1
            }
        },
        computed: {
            pager() {
                return this.$refs.pager;
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
                namedEntityService.search({search: search, offset: offset, limit: limit})
                    .then(response => {
                        this.namedEntities = response.data;
                        this.namedEntitiesCount = response.count;
                    });
            },
            searchNamedEntities(search) {
                this.pager.currentPage = 1;
                this.getNamedEntities({offset: 0, limit: this.pager.limit, search: search});
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

    .search-container {
        margin-top: 15px;
    }

    .no-records {
        text-align: center;
    }

    .pager-container {
        float: right;
    }
</style>