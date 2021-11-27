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
import { config } from "@/utils/crypto";
import { ServiceManager } from "@/utils/serviceManager";
import { ObjectMap, Service, ServiceInstance } from "nodecg-io-core/extension/service";
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
            services: [] as Service<unknown, unknown>[],
        };
    },
    computed: {
        filteredInstances() {
            const search = this.search?.toLowerCase() || "";
            const filtered = {} as ObjectMap<ServiceInstance<unknown, unknown>>;
            for (const key in this.instances) {
                if (
                    Object.prototype.hasOwnProperty.call(this.instances, key) &&
                    (key.toLowerCase().includes(search) || this.instances[key].serviceType?.includes(search))
                ) {
                    filtered[key] = this.instances[key];
                }
            }
            return filtered;
        },
    },
    mounted() {
        config.onChange((data) => {
            this.instances = data.instances;
        });
        this.serviceManager.getServices().then((services) => {
            this.services = services;
        });
    },
    methods: {
        openCreateDialog() {
            this.createDialog?.show();
        },
        showConfig(instanceName: string) {
            const instance = this.instances[instanceName];
            const service = this.services.find((svc) => svc.serviceType === instance?.serviceType);
            if (instance && service) {
                this.configDialog?.show(instanceName, instance, service);
            }
        },
        async deleteInstance(instanceName: string) {
            //todo: confirm
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
