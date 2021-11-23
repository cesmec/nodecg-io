<template>
    <div>
        <div v-if="loggedIn">
            <Config />
        </div>
        <div v-else class="auth-container">
            <div class="auth-main">
                <div>
                    <Auth />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Auth from "@/views/Auth.vue";
import Config from "@/views/Config.vue";
import { authService } from "@/services/authService";

export default defineComponent({
    name: "nodecg-io-dashboard",
    components: {
        Auth,
        Config,
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
        authService.off("loginChange", this.loginChange);
        authService.off("loadedChange", this.loadedChange);
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
.auth-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 30px);
    align-items: center;
    justify-content: space-evenly;
}

.auth-main {
    display: flex;
    width: 600px;
    max-width: 100%;
    justify-content: center;
    flex-direction: column;
}
</style>
