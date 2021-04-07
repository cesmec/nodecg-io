<template>
    <div id="divAuth">
        <!--todo: nodecg-io logo-->
        <p id="pFirstStartup" :class="firstStartup ? '' : 'hidden'">
            This seems to be your first startup of nodecg-io. Please choose a password which will be used to encrypt all
            your credentials.
        </p>
        <p>Login:</p>
        <div class="margins">
            <form :submit="submitForm">
                <label for="inputPassword">Password: </label>
                <input type="password" id="inputPassword" :value="password" />
                <button type="submit">Login</button>
            </form>
        </div>
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
.hidden {
    display: none;
}
</style>
