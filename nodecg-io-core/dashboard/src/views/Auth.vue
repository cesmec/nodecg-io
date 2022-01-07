<template>
    <template v-if="loggedIn">
        <Dashboard />
    </template>
    <template v-else>
        <Login />
    </template>
</template>

<script lang="ts">
import { authService } from "@/utils/authService";
import Dashboard from "@/views/Dashboard.vue";
import Login from "@/views/Login.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppAuth",
    components: {
        Login,
        Dashboard,
    },
    data() {
        return {
            loggedIn: false,
        };
    },
    mounted(): void {
        authService.on("loginChange", this.loginChange);
    },
    unmounted(): void {
        authService.off("loginChange", this.loginChange);
    },
    methods: {
        loginChange(loggedIn: boolean) {
            this.loggedIn = loggedIn;
        },
    },
});
</script>
