<template>
    <div class="row">
        <div class="col-12">
            <div class="street-description-container">
                <div class="row street-description-header">
                    <div class="col-12">
                        <h6 class="no-named-entity-info-message" v-if="!street.namedEntities.length">
                            На жаль, на даний момент відсутні дані про назву цієї вулиці.
                        </h6>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div class="row street-description-body" v-for="namedEntity of street.namedEntities">
                            <div class="col-12">
                                <div class="named-entity">
                                    <div class="named-entity-image-container">
                                        <div class="named-entity-image"
                                             :style="{'background-image': 'url(' + namedEntity.imageUrl + ')'}"></div>
                                    </div>
                                    <div class="named-entity-description-container">
                                        <div class="row">
                                            <div class="col-12">
                                                <h5>{{namedEntity.name}}</h5>
                                            </div>
                                        </div>
                                        <div class="row tags-container">
                                            <div class="col-12">
                                                <div v-if="namedEntity.tags">
                                                    <h6 class="tag-container" v-for="tag in namedEntity.tags">
                                                        <span class="badge badge-dark">{{tag.name}}</span>
                                                    </h6>
                                                </div>
                                                <p class="description">{{namedEntity.description}}</p>
                                            </div>
                                        </div>
                                        <div class="row wiki-links-container">
                                            <div class="col-12">
                                                <a class="btn btn-outline-dark" v-bind:href="namedEntity.wikiUrl"
                                                   target="_blank">
                                                    <i class="fab fa-wikipedia-w"></i>
                                                    {{namedEntity.name}}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row description-footer" v-if="street.wikiUrl">
                    <div class="col-12">
                        <h5>Посилання на Wikipedia:</h5>
                        <div class="wiki-links-container">
                            <a v-if="street.wikiUrl" class="btn btn-outline-dark wiki-link"
                               v-bind:href="street.wikiUrl" target="_blank">
                                <i class="fab fa-wikipedia-w"></i>
                                {{street.name}}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .street-description-container {
        padding: 20px;
        border: 1px solid #212529;
    }

    .street-description-container h5:first-child {
        margin-top: 0;
    }

    p, h5, h6 {
        margin-bottom: 0;
    }

    p {
        font-size: 14px;
    }

    a.btn {
        margin: 5px 0;
        display: inline-block;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;
    }

    .description {
        margin-top: 10px;
    }

    h6.tag-container {
        display: inline-block;
        margin-right: 5px;
        margin-top: 5px;
    }

    .wiki-links-container {
        margin-top: 5px;
    }

    .wiki-links-container a {
        margin-right: 10px;
    }

    .named-entity-image {
        background-position: top;
        background-repeat: no-repeat;
        background-size: cover;
        background-color: #e5e5e5;
        height: 100%;
        width: 100%;
        border-radius: 0;
    }

    img {
        max-height: 200px;
        width: auto;
    }

    .street-description-header h5 {
        margin-top: 5px;
    }

    .description-footer {
        margin-top: 15px;
    }

    .named-entity {
        display: flex;
        flex-direction: row;
        flex-flow: row wrap;
        justify-content: stretch;
        align-items: flex-start;
    }

    .street-description-body {
        margin-top: 20px;
    }

    .street-description-body:first-child {
        margin-top: 0;
    }

    .named-entity > div {
        flex: 1;
    }

    .named-entity .named-entity-image-container {
        height: 250px;
        flex-basis: 200px;
        flex-grow: 0;
        flex-shrink: 0;
        margin-right: 10px;
    }

    .named-entity .tags-container {
        margin-top: 5px;
    }

    .named-entity .named-entity-description-container {
        margin-left: 10px;
    }

    @media (max-width: 600px) {
        .named-entity {
            display: block;
        }

        .named-entity .named-entity-image-container {
            width: 200px;
            margin: 0px auto 20px auto;
        }

        .named-entity-image {
            width: 100%;
        }

        .named-entity .named-entity-description-container {
            margin-left: 0;
        }
    }

    @media (max-width: 300px) {
        .named-entity .named-entity-image-container {
            width: 150px;
            margin: auto;
        }
    }
</style>
<script>
    export default {
        props: {
            street: {
                type: Object,
                default: {}
            }
        },
        computed: {
            defaultImage: function () {
                return require("../../../assets/images/default-image.png");
            }
        }
    }
</script>