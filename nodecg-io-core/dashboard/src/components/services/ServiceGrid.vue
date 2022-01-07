<template>
    <h1>Service instances</h1>
    <v-text-field v-model="search" label="Search" clearable></v-text-field>
    <GridView>
        <v-btn
            v-for="(instance, name) in filteredInstances"
            :key="name"
            class="service-instance"
            :aria-label="'Service ' + name + ' of type ' + instance.serviceType"
            @click="showConfigDialog(name)"
        >
            <v-card-title class="instance-title">
                <span class="ellipsis">
                    <v-icon v-if="needsConfig(instance)" color="warning" title="Needs configuration">mdi-alert</v-icon>
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
        </v-btn>
    </GridView>
    <ServiceCreateDialog ref="createDialog" :services="services" />
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
import GridView from "@/components/GridView.vue";
import ServiceConfigDialog from "@/components/services/ServiceConfigDialog.vue";
import ServiceCreateDialog from "@/components/services/ServiceCreateDialog.vue";
import { injectionKeys } from "@/utils/constants";
import { config, ConfigData } from "@/utils/crypto";
import { filterObjectMap } from "@/utils/objectUtils";
import { ServiceManager } from "@/utils/serviceManager";
import { ObjectMap, ServiceInstance } from "nodecg-io-core/extension/service";
import { defineComponent, provide, ref } from "vue";

export default defineComponent({
    name: "ServiceGrid",
    components: {
        GridView,
        ServiceCreateDialog,
        ServiceConfigDialog,
        ConfirmDialog,
    },
    setup() {
        const serviceManager = new ServiceManager();
        provide(injectionKeys.serviceManager, serviceManager);

        return {
            serviceManager,
            createDialog: ref<InstanceType<typeof ServiceCreateDialog>>(),
            configDialog: ref<InstanceType<typeof ServiceConfigDialog>>(),
            deleteConfirmDialog: ref<InstanceType<typeof ConfirmDialog>>(),
        };
    },
    data() {
        return {
            search: "",
            instances: config.data?.instances ?? {},
            services: config.data?.services ?? [],
        };
    },
    computed: {
        filteredInstances(): ObjectMap<ServiceInstance<unknown, unknown>> {
            const search = this.search?.toLowerCase() ?? "";

            return filterObjectMap(
                this.instances,
                (instance, key) => key.toLowerCase().includes(search) || instance.serviceType?.includes(search),
            );
        },
    },
    mounted() {
        config.onChange(this.configChanged);
    },
    unmounted() {
        config.offChange(this.configChanged);
    },
    methods: {
        openCreateDialog() {
            this.createDialog?.show();
        },
        configChanged(data: ConfigData) {
            this.instances = data.instances;
            this.services = data.services;
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
        needsConfig(instance: ServiceInstance<unknown, unknown>) {
            const service = this.services.find((s) => s.serviceType === instance.serviceType);
            if (!service || service.requiresNoConfig) {
                return false;
            }
            return !instance.config;
        },
        confirmDelete(instanceName: string) {
            const deleteInstance = async () => {
                try {
                    await this.serviceManager.deleteInstance(instanceName);
                    return true;
                } catch (error) {
                    console.warn("Service instance delete failed", error);
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
    display: grid;
    grid-template-columns: 1fr 50px;
    grid-template-rows: auto auto;
    grid-auto-rows: min-content;
    padding: 0;
    margin: 10px;
    min-height: 100px;
    min-width: 200px;
    max-width: 400px;
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
