<script setup lang="ts">
import { Result } from "@/utils/result";
import { onMounted, onUnmounted, ref } from "vue";

type ConfirmCallback = () => Promise<Result<void>> | Result<void>;

defineExpose({
    show,
});

const props = defineProps({
    closeText: {
        type: String,
        default: "Close",
    },
    confirmText: {
        type: String,
        required: true,
    },
    confirmColor: {
        type: String,
        default: "secondary",
    },
    confirmDisabled: Boolean,
    canConfirmWithCtrlS: Boolean,
});

const emit = defineEmits({
    close: () => true,
});

const titleText = ref("");
const messageText = ref<string | undefined>("");
const error = ref("");
const open = ref(false);
const loading = ref(false);
const confirmCallback = ref<ConfirmCallback>();

onMounted(() => {
    window.addEventListener("keydown", keydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", keydown);
});

/**
 * Open this dialog with the specified title and optional message.
 * @param onConfirm A function that is called when the dialog is confirmed. Return a successful Result to continue and close the dialog or a failed one with a message to display.
 * @param title Dialog title
 * @param message Dialog message (optional), can not be combined with the default vue slot
 */
function show(onConfirm: ConfirmCallback, title: string, message?: string) {
    titleText.value = title;
    messageText.value = message;
    error.value = "";
    open.value = true;
    loading.value = false;
    confirmCallback.value = onConfirm;
}

async function confirm() {
    if (!props.confirmDisabled && confirmCallback.value && !loading.value) {
        loading.value = true;
        const result = await confirmCallback.value();
        loading.value = false;

        if (result.failed) {
            error.value = result.errorMessage ?? "Unknown error";
        } else {
            close();
        }
    }
}

function close() {
    open.value = false;
    emit("close");
}

function keydown(e: KeyboardEvent) {
    if (open.value && props.canConfirmWithCtrlS && e.ctrlKey && e.key === "s") {
        e.preventDefault();
        confirm();
    }
}
</script>

<template>
    <v-dialog v-model="open">
        <v-card class="small-card">
            <v-card-title>
                <span class="text-h5">{{ titleText }}</span>
            </v-card-title>
            <v-card-subtitle class="dialog-subtitle">
                <div class="dialog-subtitle-content">
                    <slot name="subtitle"></slot>
                </div>
                <v-alert v-if="error" class="error-alert" border="start" type="error" variant="tonal">
                    <span class="error-alert-text">{{ error }}</span>
                </v-alert>
            </v-card-subtitle>
            <v-card-text>
                <slot>
                    <v-row>
                        <v-col cols="12">
                            {{ messageText }}
                        </v-col>
                    </v-row>
                </slot>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="gray darken-1" @click="close">{{ closeText }}</v-btn>
                <v-btn :color="confirmColor" :loading="loading" :disabled="loading || confirmDisabled" @click="confirm">
                    {{ confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.dialog-subtitle {
    flex-direction: column;
    align-items: flex-start;
    opacity: 1;
}

.dialog-subtitle-content {
    opacity: 0.6;
}

.error-alert {
    width: 100%;
}

.error-alert-text {
    color: rgba(240, 240, 240, 0.9);
}
</style>
