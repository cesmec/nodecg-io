<template>
    <v-card elevation="2">
        <v-card-title>
            <img class="logo" alt="nodecg-io header" src="../assets/header_white.png" />
        </v-card-title>
        <v-card-text>
            <p v-if="firstStartup">
                This seems to be your first startup of nodecg-io. Please choose a password which will be used to encrypt
                all your credentials.
            </p>
            <p v-else>Dashboard Login:</p>
            <v-form @submit="submitForm" ref="form">
                <v-text-field
                    label="Password"
                    name="inputPassword"
                    type="password"
                    :rules="rules"
                    :error-messages="passwordErrors"
                    v-model="password"
                    hide-details="auto"
                />
                <v-btn class="mr-4 button" @click="submitForm">Login</v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import {} from "nodecg/types/browser";
import { Component, Ref, Vue } from "vue-property-decorator";
import { authService } from "@/services/authService";
import { isPasswordSet, setPassword } from "@/services/crypto";

@Component({})
export default class Auth extends Vue {
    firstStartup = false;

    password = "";
    passwordErrors: string[] = [];
    readonly rules = [(value: string): string | true => !!value || "Required"];

    @Ref("form") form!: { validate(): boolean };

    mounted(): void {
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

    unmounted(): void {
        //todo (https://class-component.vuejs.org/guide/caveats.html#this-value-in-property-initializer)
        //window.nodecg.socket.off("connect", this.nodecgConnect);
    }

    submitForm(e: Event): void {
        e.preventDefault();
        if (this.form.validate()) {
            this.loadFramework();
        }
    }

    async updateLoadedStatus(): Promise<void> {
        const loaded = await authService.isLoaded();

        const loggedIn = loaded && isPasswordSet();
        authService.emit("loginChange", loggedIn);
    }

    async loadFramework(): Promise<void> {
        if (await setPassword(this.password)) {
            this.passwordErrors = [];
        } else {
            this.passwordErrors = ["The provided password isn't correct!"];
        }

        this.updateLoadedStatus();
    }

    async updateFirstStartupLabel(): Promise<void> {
        this.firstStartup = await window.nodecg.sendMessage("isFirstStartup");
    }
}
</script>

<style scoped>
.logo {
    width: 80%;
}

form {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}

.button {
    margin-left: 20px;
    width: 200px;
}
</style>
