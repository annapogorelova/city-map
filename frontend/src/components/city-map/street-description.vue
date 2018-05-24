<template>
    <div class="street-description-container">
        <div class="row street-description-header">
            <div class="col-12">
                <div class="row">
                    <div class="col-12">
                        <h1 class="street-name">{{street.name}}</h1>
                        <h2 class="old-name" v-if="street.oldName">Стара назва: {{street.oldName}}</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" v-if="!street.namedEntities.length">
            <div class="col-12">
                <p class="no-named-entity-info-message">
                    На жаль, на даний момент відсутні дані про назву цієї вулиці.
                </p>
            </div>
        </div>
        <div>
            <div class="row street-description-body" v-for="namedEntity of street.namedEntities">
                <div class="col-12">
                    <div class="row">
                        <div class="col-12">
                            <h2 class="named-entity-name">{{namedEntity.name}}</h2>
                        </div>
                    </div>
                    <div class="row image-container" v-if="namedEntity.imageUrl">
                        <div class="col-12">
                            <div class="named-entity-image-container" :aria-label="'Зображення:' + namedEntity.name">
                                <div class="named-entity-image"
                                     :style="{'background-image': 'url(' + (namedEntity.imageUrl ? namedEntity.imageUrl : defaultImage) + ')'}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div class="named-entity-description-container">
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
                                        <h6 class="wiki-links-header">Посилання на Wikipedia</h6>
                                        <a class="btn btn-outline-dark" v-bind:href="namedEntity.wikiUrl"
                                           :title="namedEntity.name + ' на Wikipedia'"
                                           target="_blank">
                                            <i class="fab fa-wikipedia-w"></i>{{namedEntity.name}}
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
                <h6 class="wiki-links-header">Ця вулиця на Wikipedia:</h6>
                <a class="btn btn-outline-dark wiki-link" v-bind:href="street.wikiUrl" target="_blank"
                   :title="street.name + ' на Wikipedia'">
                    <i class="fab fa-wikipedia-w"></i>
                    {{street.name}}
                </a>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .street-description-container h5:first-child {
        margin-top: 0;
    }

    h1 {
        font-size: 1.2rem;
    }

    h2 {
        font-size: 1.2rem;
        font-weight: 300;
    }

    p, h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0;
    }

    i.fa-wikipedia-w {
        margin-right: 5px;
    }

    a.btn {
        margin: 10px 0;
        display: inline-block;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 100%;
    }

    .description {
        margin-top: 5px;
    }

    p.description {
        font-size: 14px;
    }

    h6.tag-container {
        display: inline-block;
        margin-right: 5px;
        margin-top: 5px;
        font-size: 1em;
    }

    .badge {
        font-weight: 500;
    }

    .wiki-links-container {
        margin-top: 10px;
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

    .street-description-header h5 {
        margin-top: 5px;
    }

    .description-footer {
        padding-top: 15px;
        border-top: 1px solid #939697;
    }

    .street-description-body:not(:last-child) {
        border-bottom: 1px solid #939697;
    }

    .street-description-body:not(:first-child) {
        margin-top: 20px;
    }

    .street-description-body:only-child {
        border-bottom: none;
    }

    .street-description-body:first-child {
        margin-top: 10px;
    }

    .named-entity-image-container {
        height: 220px;
        width: 200px;
        margin: auto;
    }

    .named-entity-description-container {
        margin-top: 15px;
        margin-bottom: 5px;
    }

    .old-name {
        margin-top: 5px;
    }

    .image-container {
        margin-top: 15px;
    }

    .no-named-entity-info-message {
        margin-top: 10px;
        margin-bottom: 10px;
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