<template>
    <div id="app">
        <div v-if="loggedIn">
            <p>logged in (todo)</p>
        </div>
        <div v-else class="auth-container">
            <div class="auth-main">
                <div>
                    <auth />
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
* {
    box-sizing: border-box;
}

#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: white;
}

input[type="text"],
input[type="password"],
textarea {
    color: white;
    background-color: rgb(82, 95, 120);
    border: 1px solid rgb(164, 164, 164);
    padding: 5px;
    width: 200px;
}

input[type="text"]:active,
input[type="text"]:focus,
input[type="password"]:active,
input[type="password"]:focus,
textarea:active,
textarea:focus {
    outline: 1px solid rgb(164, 164, 164);
}

/* Chrome/Opera/Safari */
::-webkit-input-placeholder {
    color: rgb(200, 200, 200);
}

/* Firefox 19+ */
::-moz-placeholder {
    color: white;
}
</style>

<style scoped>
.auth-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 30px);
    text-align: center;
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
