<template>
    <div class="autocomplete-container">
        <input class="form-control" type="text" v-model="searchText" v-on:keyup="search(searchText)"/>
        <div class="search-results-wrapper" v-if="results.length && displayAutoComplete">
            <ul class="list-group">
                <li class="search-result list-group-item" v-for="result in results"
                    v-on:click="select(result)">
                    {{result[displayPropertyName]}}
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
    import {ApiServiceMixin} from "../../mixins/index";
    import _ from "lodash";

    export default {
        props: {
            apiUrl: {
                type: String
            },
            displayPropertyName: {
                type: String,
                default: "name"
            },
            minSearchTextLength: {
                type: Number,
                default: 3
            },
            debounceTime: {
                type: Number,
                default: 2000
            },
            initialValue: {
                type: Object
            },
            clearAfterSelect: {
                type: Boolean,
                default: false
            }
        },
        mixins: [ApiServiceMixin],
        data: function () {
            return {
                searchText: undefined,
                results: [],
                displayAutoComplete: false
            }
        },
        mounted: function () {
            if (this.initialValue) {
                this.searchText = this.initialValue[this.displayPropertyName];
            }
        },
        methods: {
            search: _.debounce(function(searchText) {
                if(searchText && searchText.length >= this.minSearchTextLength) {
                    this.apiService.get(this.apiUrl, {search: searchText}).then(response => {
                        this.results = response.data;
                        this.displayAutoComplete = true;
                    });
                } else {
                    if(this.initialValue && !searchText) {
                        this.displayAutoComplete = false;
                        this.$emit("deselected");
                    }
                }
            }, this.debounceTime),
            select: function (item) {
                if(this.clearAfterSelect) {
                    this.searchText = "";
                } else {
                    this.searchText = item.name;
                }

                this.displayAutoComplete = false;
                this.$emit("selected", item);
            }
        }
    }
</script>
<style>
    .autocomplete-container {
        position: relative;
    }

    .search-results-wrapper {
        z-index: 999;
        position: absolute;
        background: #ffffff;
        width: 100%;
    }

    .list-group-item {
        cursor: pointer;
    }

    .list-group-item:hover {
        background: #F5F5F5;
    }
</style>