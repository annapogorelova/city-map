<template>
    <ul class="pagination">
        <li class="page-item" :class="{'disabled': isFirstPage}">
            <a class="page-link" v-on:click="firstPage" aria-label="First">
                <span aria-hidden="true">&laquo;</span>
                <span class="sr-only">First</span>
            </a>
        </li>
        <li class="page-item" :class="{'disabled': !hasPreviousPage}">
            <a class="page-link" v-on:click="prevPage" aria-label="Previous">
                <span aria-hidden="true">&lsaquo;</span>
                <span class="sr-only">Previous</span>
            </a>
        </li>
        <li class="page-item" v-for="page in pages" :class="{'disabled': page === currentPage}">
            <a class="page-link" v-on:click="goToPage(page)">{{page}}</a>
        </li>
        <li class="page-item" :class="{'disabled': !hasNextPage}">
            <a class="page-link" v-on:click="nextPage" aria-label="Next">
                <span aria-hidden="true">&rsaquo;</span>
                <span class="sr-only">Next</span>
            </a>
        </li>
        <li class="page-item" :class="{'disabled': isLastPage}">
            <a class="page-link" v-on:click="lastPage" aria-label="Last">
                <span aria-hidden="true">&raquo;</span>
                <span class="sr-only">Last</span>
            </a>
        </li>
    </ul>
</template>
<script>
    import _ from "lodash";

    export default {
        props: {
            limit: {
                type: Number,
                default: 10
            },
            maxPages: {
                type: Number,
                default: 3
            },
            count: {
                type: Number,
                default: 0
            }
        },
        data: function() {
            return {
                currentPage: 1
            }
        },
        mounted() {
            if (!isNaN(this.$route.query.page)) {
                this.currentPage = parseInt(this.$route.query.page);
            } else {
                this.$router.push({query: {page: this.currentPage}});
            }

            this.$emit("init");
        },
        computed: {
            numberOfPages() {
                return Math.ceil(this.count / this.limit);
            },
            hasPreviousPage() {
                return this.currentPage > 1;
            },
            hasNextPage() {
                return this.currentPage < this.numberOfPages;
            },
            isFirstPage() {
                return this.currentPage === 1;
            },
            isLastPage() {
                return this.currentPage === this.numberOfPages;
            },
            pages() {
                if((this.currentPage + this.maxPages) > this.numberOfPages &&
                    this.numberOfPages - this.maxPages > 0) {
                    return _.range(this.numberOfPages - this.maxPages + 1, this.numberOfPages + 1);
                }

                const min = _.min([this.currentPage + this.maxPages, this.numberOfPages]);
                return _.range(this.currentPage, min);
            }
        },
        methods: {
            goToPage(pageIndex) {
                this.currentPage = pageIndex;
                this.$emit("paginate", {offset: this.getOffset(), limit: this.limit});
                this.$router.push({query: {...this.$route.query, page: this.currentPage}});
            },
            nextPage() {
                this.goToPage(this.currentPage + 1);
            },
            prevPage() {
                this.goToPage(this.currentPage - 1);
            },
            firstPage() {
                this.goToPage(1);
            },
            lastPage() {
                this.goToPage(this.numberOfPages);
            },
            getOffset() {
                return (this.currentPage - 1) * this.limit;
            }
        }
    }
</script>