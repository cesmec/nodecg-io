<template>
    <div class="login-container">
        <v-card class="small-card login-card" elevation="2">
            <v-card-title>
                <img class="logo" alt="nodecg-io header" src="header_white.png" />
            </v-card-title>
            <v-card-text>
                <!-- todo: use v-form when available -->
                <form @submit="submitForm" ref="form">
                    <v-container>
                        <v-row>
                            <v-col>
                                <p v-if="firstStartup">
                                    This seems to be your first startup of nodecg-io. Please choose a password which
                                    will be used to encrypt all your credentials.
                                </p>
                                <p v-else>Please log in to manage nodecg-io</p>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    v-model="password"
                                    label="Password"
                                    type="password"
                                    autocomplete="password"
                                    :rules="rules"
                                    :error-messages="passwordErrors"
                                    hide-details="auto"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-btn class="button" block color="secondary" @click="submitForm">
                                    {{ firstStartup ? "Setup" : "Login" }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { authService } from "@/utils/authService";
import { isPasswordSet, setPassword } from "@/utils/crypto";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppLogin",
    data() {
        return {
            firstStartup: false,
            password: "",
            passwordErrors: [] as string[],
            rules: [(value: string): string | true => !!value || "Required"],
        };
    },
    mounted() {
        // Handler for when the socket.io client re-connects which is usually a nodecg restart.
        authService.on("connect", this.nodecgConnect);

        // Render loaded status for initial load
        this.updateLoadedStatus();
        this.updateFirstStartupLabel();
    },
    unmounted() {
        authService.off("connect", this.nodecgConnect);
    },
    methods: {
        nodecgConnect() {
            // If a password has been entered previously try to directly login using it.
            if (this.password) {
                this.loadFramework();
            } else {
                this.updateLoadedStatus();
                this.updateFirstStartupLabel();
            }
        },
        submitForm(e: Event) {
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
.login-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 30px);
    align-items: center;
    justify-content: space-evenly;
}

.logo {
    width: 80%;
}

.login-card {
    min-height: 300px;
}

form {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}
</style>
