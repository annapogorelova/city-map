<template>
    <div class="description-container">
        <div class="row description-header">
            <div class="col-12">
                <div class="row">
                    <div class="col-12">
                        <h1 class="name">{{street.name}}</h1>
                        <span class="old-name" v-if="street.oldName">({{constants.oldStreetNameCaption}}: {{street.oldName}})</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" v-if="street.namedEntities && !street.namedEntities.length && !street.description">
            <div class="col-12">
                <p class="no-info-message">
                    {{constants.noStreetInfoCaption}}
                </p>
            </div>
        </div>
        <div>
            <div class="row named-entity" v-for="namedEntity of street.namedEntities">
                <div class="col-12">
                    <div class="row">
                        <div class="col-12">
                            <h2>{{namedEntity.name}}</h2>
                        </div>
                    </div>
                    <div class="row image-container" v-if="namedEntity.imageUrl">
                        <div class="col-12">
                            <div class="image" :aria-label="constants.imageCaption + ':' + namedEntity.name"
                                 :style="{'background-image': 'url(' + (namedEntity.imageUrl ? namedEntity.imageUrl : defaultImage) + ')'}">
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div class="description-container">
                                <div class="row tags-container">
                                    <div class="col-12">
                                        <div v-if="namedEntity.tags && namedEntity.tags.length">
                                            <h4>{{constants.categoriesCaption}}:</h4>
                                            <h4 class="tag-container" v-for="tag in namedEntity.tags">
                                                <span class="badge badge-dark">{{tag.name}}</span>
                                            </h4>
                                        </div>
                                        <p class="description">{{namedEntity.description}}</p>
                                    </div>
                                </div>
                                <div class="row wiki-links-container">
                                    <div class="col-12">
                                        <h4 class="wiki-links-header">{{constants.wikipediaLinkCaption}}:</h4>
                                        <a class="btn btn-outline-dark wiki-link" v-bind:href="namedEntity.wikiUrl"
                                           :title="namedEntity.name + ' на Wikipedia'"
                                           target="_blank">
                                            <i class="fab fa-wikipedia-w"></i>{{namedEntity.name}}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="description-border"></div>
                </div>
            </div>
            <div class="row street" v-if="street.description">
                <div class="col-12">
                    <h2>{{constants.streetInformationCaption}}</h2>
                    <div>
                        <p v-for="paragraph in street.description.split('\n')">{{paragraph}}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row description-footer" v-if="street.wikiUrl">
            <div class="col-12">
                <div class="footer-border"></div>
                <h4 class="wiki-links-header">{{constants.streetOnWikipediaCaption}}:</h4>
                <a class="btn btn-outline-dark wiki-link" v-bind:href="street.wikiUrl" target="_blank"
                   :title="street.name + ' на Wikipedia'">
                    <i class="fab fa-wikipedia-w"></i>
                    {{street.name}}
                </a>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
    h1 {
        font-size: 1em;
        font-weight: 300;
    }

    h2 {
        font-size: 0.9em;
        font-weight: 300;
    }

    p, h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0;
    }

    .description-header {
        .name {
            font-weight: 500;
        }

        .old-name {
            margin-top: 5px;
            font-weight: 400;
        }

        h4 {
            margin-top: 5px;
        }
    }

    .tags-container h4 {
        margin-bottom: 5px;
    }

    i.fa-wikipedia-w {
        margin-right: 5px;
    }

    a.btn {
        margin-top: 10px;
        display: inline-block;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;
    }

    h6.tag-container {
        display: inline-block;
        margin-right: 5px;
        margin-top: 5px;
        font-size: 0.9em;
    }

    .badge {
        font-weight: 500;
        vertical-align: middle;
        padding-top: 5px;
        padding-bottom: 5px;
    }

    .wiki-links-container {
        margin-top: 10px;
    }

    .wiki-link {
        font-size: 0.9em;
    }

    @media(max-width: 600px) {
        .wiki-link {
            width: 100%;
        }
    }

    .street {
        margin-top: 15px;

        h2 {
            font-weight: 500;
            margin-bottom: 10px;
        }

        p {
            margin-bottom: 15px;
        }
    }

    .description-footer .footer-border{
        padding-top: 15px;
        border-top: 1px solid #bec0c0;
    }

    .named-entity {
        margin-top: 10px;

        &:not(:last-child) .description-border {
            border-bottom: 1px solid #bec0c0;
        }

        &:only-child .description-border {
            border-bottom: none;
        }

        .image-container {
            margin-top: 15px;
            margin-bottom: 10px;

            .image {
                height: 200px;
                width: 180px;
                margin: auto;
                background-position: top;
                background-repeat: no-repeat;
                background-size: cover;
                background-color: #e5e5e5;
                border-radius: 0;
            }
        }

        .description-container {
            margin-top: 5px;
            margin-bottom: 15px;

            .description {
                margin-top: 5px;
            }
        }
    }

    @media(max-width: 360px) {
        .named-entity .image-container .image {
            height: 150px !important;
            width: 130px !important;
        }
    }

    .no-info-message {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .wiki-links-header {
        font-weight: 500;
    }
</style>
<script>
    import ConstantsMixin from "../../mixins/constants-mixin"

    export default {
        props: {
            street: {
                type: Object,
                default: {}
            }
        },
        mixins: [ConstantsMixin],
        computed: {
            defaultImage: function () {
                return require("../../../static/images/default-image.png");
            }
        }
    }
</script>