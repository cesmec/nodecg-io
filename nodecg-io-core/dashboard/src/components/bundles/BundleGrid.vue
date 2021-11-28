<template>
    <div class="bundles-container">
        <h1>Bundles</h1>
        <!-- todo: similar to service instances -->
        <v-text-field class="search" v-model="search" label="Search" clearable></v-text-field>
        <GridView>
            <v-card
                v-for="(bundle, name) in filteredBundles"
                :key="name"
                :class="['bundle', bundle.active ? 'active' : '']"
            >
                <v-card-title class="bundle-title">
                    <span class="ellipsis">{{ name }}</span>
                </v-card-title>
                <v-card-text>
                    services
                    <div class="dependencies">
                        <template v-for="dep in bundle.dependencies" :key="dep">
                            <span class="dependency-type">{{ dep.serviceType }}</span>
                            <!-- todo: use v-select when available -->
                            <select
                                v-model="dep.serviceInstance"
                                style="background: white; padding: 4px"
                                @change="updateBundleDependency(name, dep)"
                            >
                                <option :value="undefined">none</option>
                                <option
                                    v-for="(service, name) in getServiceInstances(dep.serviceType)"
                                    :value="name"
                                    :key="name"
                                >
                                    {{ name }}
                                </option>
                            </select>
                        </template>
                    </div>
                </v-card-text>
            </v-card>
        </GridView>
    </div>
</template>

<script lang="ts">
import GridView from "@/components/GridView.vue";
import { Bundle, BundleManager } from "@/utils/bundleManager";
import { config } from "@/utils/crypto";
import { filterObjectMap } from "@/utils/objectUtils";
import { ObjectMap, ServiceDependency } from "nodecg-io-core/extension/service";
import { defineComponent } from "vue";

export default defineComponent({
    name: "BundleGrid",
    components: {
        GridView,
    },
    setup() {
        return {
            bundleManager: new BundleManager(),
        };
    },
    data() {
        return {
            search: "",
            bundles: BundleManager.sortBundles(config.data?.bundles ?? {}),
            instances: config.data?.instances ?? {},
        };
    },
    created() {
        config.onChange((data) => {
            this.bundles = BundleManager.sortBundles(data.bundles);
            this.instances = data.instances;
        });
    },
    computed: {
        filteredBundles(): ObjectMap<Bundle> {
            const search = this.search?.toLowerCase() || "";

            return filterObjectMap(
                this.bundles as ObjectMap<Bundle>,
                (bundle, key) =>
                    key.toLowerCase().includes(search) ||
                    bundle.dependencies.some((svc) => svc.serviceType.includes(search)),
            );
        },
    },
    methods: {
        getServiceInstances(serviceType: string) {
            return filterObjectMap(this.instances, (instance) => instance.serviceType === serviceType);
        },
        updateBundleDependency(bundleName: string, dep: ServiceDependency<unknown>) {
            if (dep.serviceInstance === "") {
                dep.serviceInstance = undefined;
            }
            this.bundleManager.updateBundleDependency(bundleName, dep);
        },
    },
});
</script>

<style scoped>
.bundles-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.search {
    flex: 0;
}

.bundle {
    margin: 10px;
    opacity: 0.75;
    min-height: 100px;
    min-width: 150px;
    max-width: 300px;
}

.bundle.active {
    opacity: 1;
}

.dependencies {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.dependency-type {
    padding: 4px;
    padding-left: 0;
}
</style>
