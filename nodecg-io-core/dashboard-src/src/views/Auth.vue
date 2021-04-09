<template>
    <div class="auth">
        <img class="logo" alt="nodecg-io header" src="../assets/header_white.png" />
        <p v-if="firstStartup">
            This seems to be your first startup of nodecg-io. Please choose a password which will be used to encrypt all
            your credentials.
        </p>
        <p v-else>Dashboard Login:</p>
        <form :submit="submitForm">
            <input type="password" id="inputPassword" :value="password" placeholder="Password" />
            <button type="submit" class="button">Login</button>
        </form>
    </div>
</template>

<script lang="ts">
import {} from "nodecg/types/browser";
import { Component, Vue } from "vue-property-decorator";
import { authService } from "@/services/authService";
import { isPasswordSet, setPassword } from "@/services/crypto";

@Component({})
export default class Auth extends Vue {
    loggedIn = false;
    loaded = false;
    firstStartup = false;

    password = "";
    passwordNotice = "";

    async mounted(): Promise<void> {
        // Handler for when the socket.io client re-connects which is usually a nodecg restart.
        window.nodecg.socket.on("connect", () => {
            // Give nodecg 200ms to fully connect so everything is usable.
            setTimeout(() => {
                // If a password has been entered previously try to directly login using it.
                if (this.password !== "") {
                    this.loadFramework();
                } else {
                    this.updateLoadedStatus();
                    this.updateFirstStartupLabel();
                }
            }, 200);
        });

        // Render loaded status for initial load
        this.updateLoadedStatus();
        this.updateFirstStartupLabel();
    }

    submitForm(e: Event): void {
        e.preventDefault();
        this.loadFramework();
    }

    async updateLoadedStatus(): Promise<void> {
        const loaded = await authService.isLoaded();

        const loggedIn = loaded && isPasswordSet();
        authService.emit("loginChange", loggedIn);
    }

    async loadFramework(): Promise<void> {
        if (await setPassword(this.password)) {
            this.passwordNotice = "";
        } else {
            this.passwordNotice = "The provided password isn't correct!";
            this.password = "";
        }

        this.updateLoadedStatus();
    }

    async updateFirstStartupLabel(): Promise<void> {
        this.firstStartup = await window.nodecg.sendMessage("isFirstStartup");
    }
}
</script>

<style scoped>
.auth {
    width: 100%;
    margin: 0 auto;
    background: rgb(44, 44, 44);
    padding: 30px;
    box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.5);
    border-radius: 5px;
}

.logo {
    width: 80%;
}

form {
    width: 200px;
    margin: 0 auto;
}

.button {
    padding: 5px;
    width: 200px;
    margin-top: 10px;
}
</style>
