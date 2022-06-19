<template>
    <div class="login-container">
        <v-card class="small-card login-card" elevation="2">
            <v-card-title>
                <img class="logo" alt="nodecg-io header" src="header_white.png" />
            </v-card-title>
            <v-card-text>
                <v-form @submit="submitForm" ref="form">
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
                                <v-btn
                                    class="button"
                                    block
                                    color="secondary"
                                    :loading="loading"
                                    :disabled="loading"
                                    @click="submitForm"
                                >
                                    {{ firstStartup ? "Setup" : "Login" }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { useStore } from "@/store";
import { isFirstStartup, isPasswordSet, setPassword } from "@/utils/crypto";
import { defineComponent, ref } from "vue";
import { VForm } from "vuetify/components";

export default defineComponent({
    name: "AppLogin",
    setup() {
        const store = useStore();

        return {
            isLoaded: store.isLoaded,
            loggedIn: store.loggedIn,
            form: ref<VForm>(),
        };
    },
    data() {
        return {
            firstStartup: false,
            loading: false,
            password: "",
            passwordErrors: [] as string[],
            rules: [(value: string): string | true => (value ? true : "Password is required")],
        };
    },
    mounted() {
        // Load initial state
        this.updateLoadedStatus();
        this.updateFirstStartupLabel();
    },
    methods: {
        async submitForm(e: Event) {
            e.preventDefault();
            const formResult = await this.form?.validate();
            if (formResult?.valid) {
                this.loading = true;
                await this.loadFramework();
                this.loading = false;
            }
        },
        async updateLoadedStatus(): Promise<void> {
            const loaded = await this.isLoaded();
            const loggedIn = loaded && isPasswordSet();
            this.loggedIn(loggedIn);
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
            this.firstStartup = await isFirstStartup();
        },
    },
});
</script>

<style scoped>
.login-container {
    display: grid;
}

.logo {
    width: 80%;
}

.login-card {
    min-height: 300px;
    place-self: center;
}

form {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}
</style>
