<template>
    <div>
        <div v-if="loggedIn">
            <Services />
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
import { authService } from "@/services/authService";
import Auth from "@/views/Auth.vue";
import Services from "@/views/Services.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "Dashboard",
    components: {
        Auth,
        Services,
    },
    data() {
        return {
            loaded: false,
            loggedIn: false,
        };
    },
    mounted(): void {
        authService.isLoaded().then(this.loadedChange);
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
