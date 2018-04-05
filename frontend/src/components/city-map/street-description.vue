<template>
    <div>
        <h5><b>Назва:</b> {{street.name}}</h5>
        <h5 v-if="street.oldName"><b>Стара назва:</b> {{street.oldName}}</h5>
        <div v-if="street.person">
            <h5><b>Названа на честь:</b> {{street.person.name}}</h5>
            <p>{{street.person.description}}</p>
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