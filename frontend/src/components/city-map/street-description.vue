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
        <div class="row" v-if="!street.namedEntities.length && !street.description">
            <div class="col-12">
                <p class="no-named-entity-info-message">
                    На жаль, на даний момент відсутні дані про назву цієї вулиці.
                </p>
            </div>
        </div>
        <div>
            <div class="row named-entity-container" v-for="namedEntity of street.namedEntities">
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
                                        <h3>Категорії:</h3>
                                        <div v-if="namedEntity.tags">
                                            <h4 class="tag-container" v-for="tag in namedEntity.tags">
                                                <span class="badge badge-dark">{{tag.name}}</span>
                                            </h4>
                                        </div>
                                        <p class="description">{{namedEntity.description}}</p>
                                    </div>
                                </div>
                                <div class="row wiki-links-container">
                                    <div class="col-12">
                                        <h2 class="wiki-links-header">Посилання на Wikipedia</h2>
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
            <div class="row street-description" v-if="street.description">
                <div class="col-12">
                    <h2>Інформація про вулицю</h2>
                    <p>{{street.description}}</p>
                </div>
            </div>
        </div>
        <div class="row description-footer" v-if="street.wikiUrl">
            <div class="col-12">
                <div class="footer-border"></div>
                <h2 class="wiki-links-header">Ця вулиця на Wikipedia:</h2>
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
        font-size: 1em;
        font-weight: 300;
    }

    h1.street-name {
        font-weight: 500;
    }

    h2 {
        font-size: 0.9em;
        font-weight: 300;
    }

    p, h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0;
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

    .description {
        margin-top: 10px;
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
        margin-bottom: 5px;
    }

    .wiki-links-container {
        margin-top: 10px;
    }

    .wiki-link {
        font-size: 0.9em;
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

    .street-description {
        margin-top: 15px;
    }

    .street-description h2 {
        font-weight: 500;
        margin-bottom: 10px;
    }

    .street-description p {
        margin-bottom: 15px;
    }

    .street-description-header h5 {
        margin-top: 5px;
    }

    .description-footer .footer-border{
        padding-top: 15px;
        border-top: 1px solid #939697;
    }

    .named-entity-container:not(:last-child) .description-border {
        border-bottom: 1px solid #939697;
    }

    .named-entity-container:not(:first-child) {
        margin-top: 15px;
    }

    .named-entity-container:only-child .description-border {
        border-bottom: none;
    }

    .named-entity-container:first-child {
        margin-top: 10px;
    }

    .named-entity-image-container {
        height: 200px;
        width: 180px;
        margin: auto;
    }

    .named-entity-description-container {
        margin-top: 5px;
        margin-bottom: 15px;
    }

    .old-name {
        margin-top: 5px;
    }

    .image-container {
        margin-top: 15px;
        margin-bottom: 10px;
    }

    .no-named-entity-info-message {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .wiki-links-header {
        font-weight: 500;
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
                return require("../../../static/images/default-image.png");
            }
        }
    }
</script>