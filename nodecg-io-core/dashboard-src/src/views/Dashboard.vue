<template>
    <div>
        <div v-if="loggedIn">
            <p>logged in (todo)</p>
        </div>
        <div v-else class="auth-container">
            <div class="auth-main">
                <div>
                    <Auth />
                </div>
            </div>
            <div class="auth-footer">
                <p>Minzig!</p>
                <p>Status: {{ loaded ? "Loaded" : "Not loaded" }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Auth from "@/components/Auth.vue";
import { authService } from "@/services/authService";

@Component({
    components: {
        Auth,
    },
})
export default class Dashboard extends Vue {
    loaded = false;
    loggedIn = false;

    async mounted(): Promise<void> {
        this.loaded = await authService.isLoaded();
        authService.on("loadedChange", (loaded) => {
            this.loaded = loaded;
        });
        authService.on("loginChange", (loggedIn: boolean) => {
            this.loggedIn = loggedIn;
        });
    }

    unmounted(): void {
        //todo (https://class-component.vuejs.org/guide/caveats.html#this-value-in-property-initializer)
        //authService.off("loginChange", this.loginChange);
        //authService.off("loadedChange", this.loadedChange);
    }
}
</script>

<style scoped>
.auth-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 30px);
    align-items: center;
    justify-content: space-evenly;
}

.auth-footer > p {
    margin: 2px 0;
}

.auth-main {
    display: flex;
    width: 600px;
    max-width: 100%;
    justify-content: center;
    flex-direction: column;
}
</style>
