<template>
    <div class="description-container">
        <h5><b>Назва:</b> {{street.name}}</h5>
        <h5 v-if="street.oldName"><b>Стара назва:</b> {{street.oldName}}</h5>
        <div v-if="street.namedEntities.length" class="mt-10">
            <h5><b>Названа на честь:</b> {{street.namedEntities.map(n => n.name).join(', ')}}</h5>
            <div v-for="namedEntity in street.namedEntities">
                <div v-if="namedEntity.tags">
                    <h5 class="tag-container" v-for="tag in namedEntity.tags">
                        <span class="badge badge-dark">{{tag.name}}</span>
                    </h5>
                </div>
                <p class="description">{{namedEntity.description}}</p>
            </div>
        </div>
        <div class="links-container" v-if="street.wikiUrl || street.namedEntities.length">
            <h5>Посилання (Wikipedia)</h5>
            <a v-if="street.wikiUrl" class="btn btn-light" v-bind:href="street.wikiUrl" target="_blank">
                {{street.name}}
            </a>
            <a v-for="namedEntity in street.namedEntities"
               class="btn btn-light" v-bind:href="namedEntity.wikiUrl" target="_blank">
                {{namedEntity.name}}
            </a>
        </div>
    </div>
</template>
<style scoped>
    .description-container {
        padding: 15px;
        border: 1px solid #212529;
    }

    .links-container {
        margin-top: 15px;
    }

    p, h5 {
        margin-bottom: 0;
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

    h5.tag-container {
        display: inline-block;
        margin-right: 5px;
        margin-top: 5px;
    }
</style>
<script>
    export default {
        props: {
            street: {
                type: Object,
                default: () => {
                }
            }
        }
    }
</script>