<template>
    <div>
        <h1>Service instances</h1>
        <v-text-field v-model="search" label="Search" clearable></v-text-field>
        <GridView>
            <v-card
                v-for="(instance, name) in filteredInstances"
                :key="name"
                class="service-instance"
                @click="showConfig(name)"
            >
                <v-card-title class="instance-title">
                    <span class="ellipsis">{{ name }}</span>
                    <v-btn color="error" icon="mdi-delete" size="small" @click.stop="deleteInstance(name)"></v-btn>
                </v-card-title>
                <v-card-subtitle>{{ instance.serviceType }}</v-card-subtitle>
            </v-card>
        </GridView>
        <ServiceCreateDialog ref="createDialog" :services="services" />
        <ServiceConfigDialog ref="configDialog" />
        <v-btn
            class="btn-create"
            color="secondary"
            elevation="2"
            icon="mdi-plus"
            size="large"
            @click="openCreateDialog"
        ></v-btn>
    </div>
</template>

<script lang="ts">
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
    },
    setup() {
        const serviceManager = new ServiceManager();
        provide(injectionKeys.serviceManager, serviceManager);

        return {
            serviceManager,
            createDialog: ref<InstanceType<typeof ServiceCreateDialog>>(),
            configDialog: ref<InstanceType<typeof ServiceConfigDialog>>(),
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
            const search = this.search?.toLowerCase() || "";

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
        showConfig(instanceName: string) {
            const instance = this.instances[instanceName];
            const service = this.services.find((svc) => svc.serviceType === instance?.serviceType);
            if (instance && service) {
                this.configDialog?.show(instanceName, instance, service);
            }
        },
        async deleteInstance(instanceName: string) {
            //todo: confirm delete
            try {
                await this.serviceManager.deleteInstance(instanceName);
            } catch (error) {
                console.log("delete failed", error);
            }
        },
    },
});
</script>

<style scoped>
.service-instance {
    margin: 10px;
    min-height: 100px;
    min-width: 200px;
    max-width: 400px;
}

.instance-title {
    justify-content: space-between;
}

.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.btn-create {
    position: absolute;
    bottom: 20px;
    right: 20px;
}
</style>
