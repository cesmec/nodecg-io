<script setup lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ServiceConfigDialog from "@/components/services/ServiceConfigDialog.vue";
import ServiceCreateDialog from "@/components/services/ServiceCreateDialog.vue";
import ServiceGridInstance from "@/components/services/ServiceGridInstance.vue";
import { useStore, useStoreState } from "@/store";
import { emptySuccess, error } from "@/utils/result";
import { deleteServiceInstance } from "@/utils/services";
import { ServiceInstance } from "@/utils/types";
import { computed, ref } from "vue";

const createDialog = ref<InstanceType<typeof ServiceCreateDialog>>();
const configDialog = ref<InstanceType<typeof ServiceConfigDialog>>();
const deleteConfirmDialog = ref<InstanceType<typeof ConfirmDialog>>();

const search = ref("");

const store = useStore();
const { instances, services } = useStoreState();
const filteredInstances = computed(() => store.filterInstances(search.value));

function openCreateDialog() {
    createDialog.value?.show();
}

function getService(instance: ServiceInstance) {
    return services.value.find((service) => service.serviceType === instance.serviceType);
}

function showConfigDialog(instanceName: string) {
    const instance = instances.value[instanceName];
    const service = instance ? getService(instance) : undefined;
    if (instance && service) {
        configDialog.value?.show(instanceName, instance, service);
    }
}

/**
 * Tests if the service instance requires a config but has none.
 * @param instance Service instance to test
 */
function needsConfig(instance: ServiceInstance) {
    const service = getService(instance);
    if (!service || service.requiresNoConfig) {
        return false;
    }
    return !instance.config;
}

function confirmToDelete(instanceName: string) {
    const deleteInstance = async () => {
        try {
            await deleteServiceInstance(instanceName);
            return emptySuccess();
        } catch (err) {
            return error(err instanceof Error ? err.message : String(err));
        }
    };

    deleteConfirmDialog.value?.show(
        deleteInstance,
        "Delete service instance",
        `Do you want to delete instance "${instanceName}"?`,
    );
}
</script>

<template>
    <h1>Service instances</h1>
    <v-text-field v-model="search" class="grid-view-search" label="Search" clearable></v-text-field>
    <div class="grid-view-container">
        <ServiceGridInstance
            v-for="(instance, name) in filteredInstances"
            :key="name"
            :name="name"
            :instance="instance"
            :needsConfig="needsConfig(instance)"
            @click:config="showConfigDialog(name)"
            @click:delete="confirmToDelete(name)"
        />
    </div>
    <ServiceCreateDialog ref="createDialog" />
    <ServiceConfigDialog ref="configDialog" />
    <ConfirmDialog ref="deleteConfirmDialog" confirmText="Delete" closeText="Cancel" confirmColor="error" />
    <v-btn
        class="btn-create-service"
        title="Create new service"
        color="secondary"
        elevation="2"
        icon="mdi-plus"
        size="large"
        @click="openCreateDialog"
    ></v-btn>
</template>

<style>
.btn-create-service {
    position: absolute;
    bottom: 20px;
    right: 20px;
}
</style>
