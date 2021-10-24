<template>
    <v-card class="auth-card" elevation="2">
        <v-card-title>
            <img class="logo" alt="nodecg-io header" src="header_white.png" />
        </v-card-title>
        <v-card-text>
            <form @submit="submitForm" ref="form">
                <v-container>
                    <v-row>
                        <v-col>
                            <p v-if="firstStartup">
                                This seems to be your first startup of nodecg-io. Please choose a password which will be
                                used to encrypt all your credentials.
                            </p>
                            <p v-else>Please log in to manage nodecg-io</p>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-text-field
                                label="Password"
                                name="inputPassword"
                                type="password"
                                :rules="rules"
                                :error-messages="passwordErrors"
                                v-model="password"
                                hide-details="auto"
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn class="button" @click="submitForm" block color="secondary">
                                {{ firstStartup ? "Setup" : "Login" }}
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </form>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { authService } from "@/services/authService";
import { isPasswordSet, setPassword } from "@/services/crypto";

export default defineComponent({
    name: "Auth",
    data() {
        return {
            firstStartup: false,
            password: "",
            passwordErrors: [] as string[],
            rules: [(value: string): string | true => !!value || "Required"],
        };
    },
    mounted(): void {
        // Handler for when the socket.io client re-connects which is usually a nodecg restart.
        authService.on("connect", this.nodecgConnect);

        // Render loaded status for initial load
        this.updateLoadedStatus();
        this.updateFirstStartupLabel();
    },
    unmounted(): void {
        authService.off("connect", this.nodecgConnect);
    },
    methods: {
        nodecgConnect(): void {
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
        },
        submitForm(e: Event): void {
            e.preventDefault();
            const form = this.$refs.form as HTMLFormElement; // as { validate(): boolean };
            if (form.reportValidity()) {
                this.loadFramework();
            }
        },
        async updateLoadedStatus(): Promise<void> {
            const loaded = await authService.isLoaded();

            const loggedIn = loaded && isPasswordSet();
            authService.emit("loginChange", loggedIn);
        },
        async loadFramework(): Promise<void> {
            if (await setPassword(this.password)) {
                this.passwordErrors = [];
            } else {
                this.passwordErrors = ["The provided password is incorrect!"];
            }

            this.updateLoadedStatus();
        },
        async updateFirstStartupLabel(): Promise<void> {
            this.firstStartup = await authService.isFirstStartup();
        },
    },
});
</script>

<style scoped>
.logo {
    width: 80%;
}

.auth-card {
    min-height: 300px;
}

form {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}
</style>
