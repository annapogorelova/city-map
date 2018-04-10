<template>
    <div>
        <h5><b>Назва:</b> {{street.name}}</h5>
        <h5 v-if="street.oldName"><b>Стара назва:</b> {{street.oldName}}</h5>
        <div v-if="street.namedEntity">
            <h5><b>Названа на честь:</b> {{street.namedEntity.name}}</h5>
            <p>{{street.namedEntity.description}}</p>
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            street: {
                type: Object,
                default: () => {}
            }
        }
    }
</script>
<style></style>