<template>
    <v-dialog v-model="open">
        <v-card class="small-card">
            <v-card-title>
                <span class="text-h5">{{ title }}</span>
            </v-card-title>
            <v-card-subtitle class="dialog-subtitle">
                <div class="dialog-subtitle-content">
                    <slot name="subtitle"></slot>
                </div>
                <v-alert v-if="error" class="error-alert" border="start" type="error">
                    <span class="error-alert-text">{{ error }}</span>
                </v-alert>
            </v-card-subtitle>
            <v-card-text>
                <slot>
                    <v-row>
                        <v-col cols="12">
                            {{ message }}
                        </v-col>
                    </v-row>
                </slot>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="gray darken-1" @click="close">{{ closeText }}</v-btn>
                <LoadingBtn :color="confirmColor" :loading="loading" :disabled="confirmDisabled" @click="confirm">
                    {{ confirmText }}
                </LoadingBtn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import LoadingBtn from "@/components/LoadingBtn.vue";
import { defineComponent, ref } from "vue";

export type ConfirmResult = true | string;
type ConfirmCallback = () => Promise<ConfirmResult> | ConfirmResult;

export default defineComponent({
    name: "ConfirmDialog",
    components: {
        LoadingBtn,
    },
    props: {
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
    },
    emits: {
        close: () => true,
    },
    data() {
        return {
            title: "",
            message: "" as string | undefined,
            error: "",
            open: false,
            loading: false,
            confirmCallback: ref<ConfirmCallback>(),
        };
    },
    mounted() {
        window.addEventListener("keydown", this.keydown);
    },
    unmounted() {
        window.removeEventListener("keydown", this.keydown);
    },
    methods: {
        /**
         * Open this dialog with the specified title and optional message.
         * @param confirmCallback A function that is called when the dialog is confirmed. Return true to continue and close the dialog or an error message to display.
         * @param title Dialog title
         * @param message Dialog message (optional), can not be combined with the default vue slot
         */
        show(confirmCallback: ConfirmCallback, title: string, message?: string) {
            this.title = title;
            this.message = message;
            this.error = "";
            this.open = true;
            this.loading = false;
            this.confirmCallback = confirmCallback;
        },
        async confirm() {
            if (this.confirmCallback && !this.loading) {
                this.loading = true;
                const result = await this.confirmCallback();
                this.loading = false;

                if (result === true) {
                    this.close();
                } else {
                    this.error = result ?? "Unknown error";
                }
            }
        },
        close() {
            this.open = false;
            this.$emit("close");
        },
        keydown(e: KeyboardEvent) {
            if (this.open && this.canConfirmWithCtrlS && e.ctrlKey && e.key === "s") {
                e.preventDefault();
                this.confirm();
            }
        },
    },
});
</script>

<style scoped>
.dialog-subtitle {
    flex-direction: column;
    align-items: flex-start;
    opacity: 1;
}

.dialog-subtitle-content {
    opacity: 0.6;
}
</style>
