<template>
    <template v-if="loggedIn">
        <Dashboard />
    </template>
    <template v-else>
        <Login />
    </template>
</template>

<script lang="ts">
import { useStore } from "@/store";
import Dashboard from "@/views/Dashboard.vue";
import Login from "@/views/Login.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppAuth",
    components: {
        Login,
        Dashboard,
    },
    setup() {
        return {
            store: useStore(),
        };
    },
    computed: {
        loggedIn(): boolean {
            return this.store.state.loggedIn;
        },
    },
});
</script>
