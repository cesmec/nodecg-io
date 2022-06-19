<template>
    <h1>Service instances</h1>
    <v-text-field v-model="search" class="grid-view-search" label="Search" clearable></v-text-field>
    <div class="grid-view-container">
        <v-btn
            v-for="(instance, name) in filteredInstances"
            :key="name"
            class="service-instance"
            :aria-label="'Service ' + name + ' of type ' + instance.serviceType"
            @click="showConfigDialog(name)"
        >
            <div class="service-instance-content">
                <v-card-title class="instance-title">
                    <span class="ellipsis">
                        <v-icon v-if="needsConfig(instance)" color="warning" title="Needs configuration"
                            >mdi-alert</v-icon
                        >
                        {{ name }}
                    </span>
                </v-card-title>
                <v-card-subtitle class="instance-type">{{ instance.serviceType }}</v-card-subtitle>
                <v-btn
                    class="btn-delete-service"
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    title="Delete"
                    :aria-label="'Delete service ' + name"
                    @click.stop="confirmDelete(name)"
                ></v-btn>
            </div>
        </v-btn>
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

<script lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ServiceConfigDialog from "@/components/services/ServiceConfigDialog.vue";
import ServiceCreateDialog from "@/components/services/ServiceCreateDialog.vue";
import { useStore } from "@/store";
import { deleteServiceInstance } from "@/utils/services";
import { ObjectMap, Service, ServiceInstance } from "@/utils/types";
import { defineComponent, ref } from "vue";

export default defineComponent({
    name: "ServiceGrid",
    components: {
        ServiceCreateDialog,
        ServiceConfigDialog,
        ConfirmDialog,
    },
    setup() {
        const store = useStore();

        return {
            store,
            filterInstances: store.filterInstances,
            createDialog: ref<InstanceType<typeof ServiceCreateDialog>>(),
            configDialog: ref<InstanceType<typeof ServiceConfigDialog>>(),
            deleteConfirmDialog: ref<InstanceType<typeof ConfirmDialog>>(),
        };
    },
    data() {
        return {
            search: "",
        };
    },
    computed: {
        filteredInstances(): ObjectMap<ServiceInstance> {
            return this.filterInstances(this.search);
        },
        services(): Service[] {
            return this.store.state.services;
        },
        instances(): ObjectMap<ServiceInstance> {
            return this.store.state.instances;
        },
    },
    methods: {
        openCreateDialog() {
            this.createDialog?.show();
        },
        showConfigDialog(instanceName: string) {
            const instance = this.instances[instanceName];
            const service = this.services.find((svc) => svc.serviceType === instance?.serviceType);
            if (instance && service) {
                this.configDialog?.show(instanceName, instance, service);
            }
        },
        /**
         * Tests if the service instance requires a config but has none.
         * @param instance Service instance to test
         */
        needsConfig(instance: ServiceInstance) {
            const service = this.services.find((s) => s.serviceType === instance.serviceType);
            if (!service || service.requiresNoConfig) {
                return false;
            }
            return !instance.config;
        },
        confirmDelete(instanceName: string) {
            const deleteInstance = async () => {
                try {
                    await deleteServiceInstance(instanceName);
                    return true;
                } catch (error) {
                    return typeof error === "string" ? error : "Unknown error";
                }
            };

            this.deleteConfirmDialog?.show(
                deleteInstance,
                "Delete service instance",
                `Do you want to delete instance "${instanceName}"?`,
            );
        },
    },
});
</script>

<style>
.service-instance {
    padding: 0;
    margin: 10px;
    min-height: 100px;
    min-width: 200px;
    max-width: 400px;
    overflow: hidden;
}

.service-instance > .v-btn__content {
    width: 100%;
}

.service-instance-content {
    display: grid;
    grid-template-columns: 1fr 50px;
    grid-template-rows: auto auto;
    grid-auto-rows: min-content;
    padding: 0;
    margin: 0;
    width: 100%;
    overflow: hidden;
}

.instance-title {
    grid-column: 1;
    grid-row: 1;
}

.instance-type {
    grid-column: 1;
    grid-row: 2;
}

.btn-delete-service {
    grid-area: 1 / 2 / span 2;
    place-self: center;
}

.btn-create-service {
    position: absolute;
    bottom: 20px;
    right: 20px;
}
</style>
