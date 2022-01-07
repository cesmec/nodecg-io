<template>
    <ConfirmDialog ref="dialog" confirmText="Create" :confirmCallback="saveNewInstance" canConfirmWithCtrlS>
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
import { injectionKeys } from "@/utils/constants";
import { Service } from "nodecg-io-core/extension/service";
import { defineComponent, inject, PropType, ref } from "vue";

export default defineComponent({
    name: "ServiceCreateDialog",
    components: {
        ConfirmDialog,
    },
    props: {
        services: {
            type: Array as PropType<Service<unknown, unknown>[]>,
            required: true,
        },
    },
    setup() {
        return {
            serviceManager: inject(injectionKeys.serviceManager),
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
            return this.services.map((service) => service.serviceType);
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
                await this.serviceManager?.createService(this.type, this.name);
                return true;
            } catch (error) {
                console.warn("Failed to create service instance", error);
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
