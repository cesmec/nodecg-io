<template>
    <ConfirmDialog ref="dialog" confirmText="Create" canConfirmWithCtrlS>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="name" label="Name" required></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <!--<v-col cols="12">
                <v-select v-model="type" :items="serviceTypes" label="Type" required></v-select>
            </v-col>-->
            <v-col cols="12">
                <!-- todo: use v-select when available -->
                <select v-model="type" style="background: white">
                    <option v-for="serviceType in serviceTypes" :value="serviceType" :key="serviceType">
                        {{ serviceType }}
                    </option>
                </select>
            </v-col>
        </v-row>
    </ConfirmDialog>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useStore } from "@/store";
import { createServiceInstance } from "@/utils/services";
import { defineComponent, ref } from "vue";

export default defineComponent({
    name: "ServiceCreateDialog",
    components: {
        ConfirmDialog,
    },
    setup() {
        return {
            store: useStore(),
            dialog: ref<InstanceType<typeof ConfirmDialog>>(),
        };
    },
    data() {
        return {
            name: "",
            type: "",
        };
    },
    computed: {
        serviceTypes(): string[] {
            return this.store.serviceTypes;
        },
    },
    methods: {
        show() {
            this.name = "";
            this.type = "";

            this.dialog?.show(this.saveNewInstance, "Create service instance");
        },
        async saveNewInstance() {
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
