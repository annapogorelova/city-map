<script>
    export default {
        created: function () {
            this.$dc.get("auth").signOut().then(() => this.$router.push({name: "map"}));
        }
    }
</script>