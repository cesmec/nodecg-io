<template>
    <div v-if="loggedIn">
        <Dashboard />
    </div>
    <div v-else class="login-container">
        <Login />
    </div>
</template>

<script lang="ts">
import { authService } from "@/utils/authService";
import Login from "@/views/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "nodecg-io-auth",
    components: {
        Login,
        Dashboard,
    },
    data() {
        return {
            loaded: false,
            loggedIn: false,
        };
    },
    mounted(): void {
        authService.isLoaded().then((loaded) => this.loadedChange(loaded));
        authService.on("loadedChange", this.loadedChange);
        authService.on("loginChange", this.loginChange);
    },
    unmounted(): void {
        authService.off("loadedChange", this.loadedChange);
        authService.off("loginChange", this.loginChange);
    },
    methods: {
        loginChange(loggedIn: boolean) {
            this.loggedIn = loggedIn;
        },
        loadedChange(loaded: boolean) {
            this.loaded = loaded;
        },
    },
});
</script>

<style scoped>
.login-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 30px);
    align-items: center;
    justify-content: space-evenly;
}
</style>
