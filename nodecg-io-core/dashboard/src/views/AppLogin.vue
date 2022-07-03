<script setup lang="ts">
import { useStore } from "@/store";
import { isFirstStartup, isPasswordSet, setPassword } from "@/utils/crypto";
import { VuetifyValidationRule } from "@/utils/types";
import { onMounted, ref } from "vue";
import type { VForm } from "vuetify/components";

const { isLoaded, loggedIn } = useStore();

const passwordRules: VuetifyValidationRule[] = [(value) => (value ? true : "Password is required")];

const form = ref<VForm>();
const firstStartup = ref(false);
const loading = ref(false);
const password = ref("");
const passwordErrors = ref<string[]>([]);

onMounted(() => {
    // Load initial state
    updateLoadedStatus();
    updateFirstStartupLabel();
});

async function submitForm(e: Event) {
    e.preventDefault();
    const formResult = await form.value?.validate();
    if (formResult?.valid) {
        loading.value = true;
        await loadFramework();
        loading.value = false;
    }
}

async function updateLoadedStatus(): Promise<void> {
    const loaded = await isLoaded();
    const isLoggedIn = loaded && isPasswordSet();
    loggedIn(isLoggedIn);
}

async function loadFramework(): Promise<void> {
    if (await setPassword(password.value)) {
        passwordErrors.value = [];
    } else {
        passwordErrors.value = ["The provided password is incorrect!"];
    }

    updateLoadedStatus();
}

async function updateFirstStartupLabel(): Promise<void> {
    firstStartup.value = await isFirstStartup();
}
</script>

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
                                    :rules="passwordRules"
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
