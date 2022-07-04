<script setup lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useStore } from "@/store";
import { createServiceInstance } from "@/utils/services";
import { VuetifyValidationRule } from "@/utils/types";
import { computed, ref, watch } from "vue";
import type { VForm, VTextField } from "vuetify/components";

defineExpose({
    show,
});

const dialog = ref<InstanceType<typeof ConfirmDialog>>();

const nameRules: VuetifyValidationRule[] = [(name) => (name ? true : "Name is required")];
const typeRules: VuetifyValidationRule[] = [(type) => (type ? true : "Type is required")];

const name = ref("");
const type = ref("");

const form = ref<VForm>();
const nameField = ref<VTextField>();

const store = useStore();
const serviceTypes = computed(() => store.serviceTypes);

watch(name, () => nameField.value?.resetValidation());
// Reset validation is currently not supported on v-select directly
watch(type, () => form.value?.resetValidation());

function show() {
    name.value = "";
    type.value = "";

    dialog.value?.show(saveNewInstance, "Create service instance");
}

async function saveNewInstance() {
    try {
        await createServiceInstance(type.value, name.value);
        return true;
    } catch (error) {
        return typeof error === "string" ? error : "Unknown error";
    }
}
</script>

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
