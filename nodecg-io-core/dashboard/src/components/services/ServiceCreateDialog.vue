<template>
    <ConfirmDialog ref="dialog" confirmText="Create" canConfirmWithCtrlS>
        <v-form ref="form">
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        ref="nameField"
                        v-model="name"
                        :rules="nameRules"
                        label="Name"
                        required
                        hide-details="auto"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-select
                        ref="typeField"
                        v-model="type"
                        :items="serviceTypes"
                        :rules="typeRules"
                        label="Type"
                        required
                        hide-details="auto"
                    ></v-select>
                </v-col>
            </v-row>
        </v-form>
    </ConfirmDialog>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useStore } from "@/store";
import { createServiceInstance } from "@/utils/services";
import { defineComponent, ref } from "vue";
import { VForm, VTextField } from "vuetify/components";

export default defineComponent({
    name: "ServiceCreateDialog",
    components: {
        ConfirmDialog,
    },
    setup() {
        return {
            store: useStore(),
            dialog: ref<InstanceType<typeof ConfirmDialog>>(),
            form: ref<VForm>(),
            nameField: ref<VTextField>(),
        };
    },
    data() {
        return {
            name: "",
            type: "",
            nameRules: [(name: string): string | true => (name ? true : "Name is required")],
            typeRules: [(type: string): string | true => (type ? true : "Type is required")],
        };
    },
    computed: {
        serviceTypes(): string[] {
            return this.store.serviceTypes;
        },
    },
    watch: {
        name() {
            this.nameField?.resetValidation();
        },
        type() {
            // Reset validation is currently not supported on v-select directly
            this.form?.resetValidation();
        },
    },
    methods: {
        show() {
            this.name = "";
            this.type = "";

            this.dialog?.show(this.saveNewInstance, "Create service instance");
        },
        async saveNewInstance() {
            const result = await this.form?.validate();
            if (!result?.valid) {
                return "";
            }

            try {
                await createServiceInstance(this.type, this.name);
                return true;
            } catch (error) {
                return typeof error === "string" ? error : "Unknown error";
            }
        },
    },
});
</script>

<style>
.error-alert {
    width: 100%;
}

.error-alert-text {
    display: grid;
    align-items: center;
}
</style>
