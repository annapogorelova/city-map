<template>
    <div class="description-container">
        <h5><b>Назва:</b> {{street.name}}</h5>
        <h5 v-if="street.oldName"><b>Стара назва:</b> {{street.oldName}}</h5>
        <div v-if="street.namedEntity" class="mt-10">
            <h5><b>Названа на честь:</b> {{street.namedEntity.name}}</h5>
            <p class="description">{{street.namedEntity.description}}</p>
        </div>
        <div class="links-container" v-if="street.wikiUrl || (street.namedEntity && street.namedEntity.wikiUrl)">
            <h5>Посилання (Wikipedia)</h5>
            <a v-if="street.wikiUrl" class="btn btn-light" v-bind:href="street.wikiUrl" target="_blank">
                {{street.name}}
            </a>
            <a v-if="street.namedEntity && street.namedEntity.wikiUrl"
               class="btn btn-light" v-bind:href="street.namedEntity.wikiUrl" target="_blank">
                {{street.namedEntity.name}}
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