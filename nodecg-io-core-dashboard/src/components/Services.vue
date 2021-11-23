<template>
    <div>
        <h1>Service instances</h1>
        <v-text-field v-model="search" label="Search" clearable></v-text-field>
        <GridView>
            <v-card v-for="(instance, name) in filteredInstances" :key="name">
                <v-card-title>{{ name }}</v-card-title>
                <v-card-subtitle>{{ instance.serviceType }}</v-card-subtitle>
            </v-card>
        </GridView>
        <CreateService ref="createDialog" @save="saveNewInstance"></CreateService>
        <v-btn color="primary" elevation="2" fab @click="openCreateDialog">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { config } from "@/services/crypto";
import GridView from "@/components/GridView.vue";
import CreateService from "@/components/CreateService.vue";
import { ObjectMap, ServiceInstance } from "nodecg-io-core/extension/service";

export default defineComponent({
    name: "nodecg-io-services",
    components: {
        GridView,
        CreateService,
    },
    setup() {
        const createDialog = ref<InstanceType<typeof CreateService>>();
        return {
            createDialog,
        };
    },
    data() {
        const instances = config.data?.instances || {};
        return {
            search: "",
            instances,
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
    },
    methods: {
        openCreateDialog() {
            this.createDialog?.show();
        },
        saveNewInstance({ name, type }: { name: string; type: string }) {
            //todo: actually save instance
            console.log("created", name, type);
            this.instances[name] = { serviceType: type, config: "", client: "" };
        },
    },
});
</script>

<style scoped></style>
