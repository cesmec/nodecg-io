<template>
    <div id="app">
        <p>Minzig!</p>
        <p>Status: {{ loaded ? "Loaded" : "Not loaded" }}</p>
        <div v-if="loggedIn">
            <p>logged in (todo)</p>
        </div>
        <div v-else>
            <auth />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from "vue-property-decorator";
import Auth from "@/views/Auth.vue";
import { authService } from "./services/authService";

@Component({
    components: {
        Auth,
    },
})
export default class App extends Vue {
    @Provide()
    loaded = false;
    @Provide()
    loggedIn = false;

    async mounted(): Promise<void> {
        this.loaded = await authService.isLoaded();
        authService.on("loadedChange", (loaded) => {
            this.loaded = loaded;
        });
        authService.on("loginChange", (loggedIn) => {
            this.loggedIn = loggedIn;
        });
    }
}
</script>

<style>
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: white;
}
</style>
