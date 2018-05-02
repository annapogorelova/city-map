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
                    <search v-on:search="searchStreets"></search>
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
                                    {{`${street.description.substring(0, 60)}...`}}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn float-right">Ред.</button>
                                </td>
                            </tr>
                            <tr v-if="!streets.length">
                                <td class="no-records" colspan="4">No Records (select city please)</td>
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
                               :pageNumber="pageNumber"
                               v-on:paginate="getStreets"></pager>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import CitiesList from "../shared/cities-list";
    import Pager from "../shared/pager";
    import Search from "../shared/search";

    export default {
        components: {Search, CitiesList, Pager},
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
                pageNumber: 1
            }
        },
        computed: {
            pager() {
                return this.$refs.pager;
            }
        },
        mounted: function () {
            if (!isNaN(this.$route.query.cityId)) {
                this.cityId = parseInt(this.$route.query.cityId);
            }

            if (!isNaN(this.$route.query.page)) {
                this.pageNumber = parseInt(this.$route.query.page);
            }

            if(this.cityId) {
                this.getStreets({offset: this.pager.offset, limit: this.pager.limit});
            }
        },
        methods: {
            getStreets({offset, limit, search = null}) {
                this.$dc.get("streets").search({cityId: this.cityId, search: search, offset: offset, limit: limit})
                    .then(response => {
                        debugger
                        this.streets = response.data;
                        this.streetsCount = response.count;
                    });
            },
            searchStreets(search) {
                this.pager.currentPage = 1;
                this.getStreets({offset: 0, limit: this.pager.limit, search: search});
            },
            onCitySelected(city) {
                if (city && city.id !== this.cityId) {
                    const query = {cityId: city.id};
                    this.$router.push({query: query});
                    this.getStreets({offset: this.pager.offset, limit: this.pager.limit});
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
</style>