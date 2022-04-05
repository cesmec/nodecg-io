<template>
    <h1>Bundles</h1>
    <v-text-field v-model="search" class="grid-view-search" label="Search" clearable></v-text-field>
    <div class="grid-view-container">
        <v-card v-for="(bundle, name) in filteredBundles" :key="name" :class="{ bundle: true, active: bundle.active }">
            <v-card-title class="bundle-title">
                <span class="ellipsis">{{ name }}</span>
            </v-card-title>
            <v-card-text>
                services
                <div class="bundle-dependencies">
                    <template v-for="dep in bundle.dependencies" :key="dep.serviceType">
                        <span class="dependency-type">{{ dep.serviceType }}</span>
                        <!-- todo: use v-select when available -->
                        <select
                            style="background: white; padding: 4px"
                            @input="(e) => updateBundleDependency(name, dep, (e.target as any).selectedOptions[0]._value)"
                        >
                            <option :value="undefined" :selected="dep.serviceInstance === undefined">none</option>
                            <option
                                v-for="(_instance, name) in getServiceInstances(dep.serviceType)"
                                :value="name"
                                :key="name"
                                :selected="dep.serviceInstance === name"
                            >
                                {{ name }}
                            </option>
                        </select>
                    </template>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script lang="ts">
import { useStore } from "@/store";
import { updateBundleDependency } from "@/utils/bundles";
import { filterObjectMap } from "@/utils/objectUtils";
import { Bundle, ObjectMap, ServiceInstance } from "@/utils/types";
import { defineComponent } from "vue";

export default defineComponent({
    name: "BundleGrid",
    setup() {
        const store = useStore();

        return {
            store,
            filterBundles: store.filterBundles,
            updateBundleDependency,
        };
    },
    data() {
        return {
            search: "",
        };
    },
    computed: {
        filteredBundles(): ObjectMap<Bundle> {
            return this.filterBundles(this.search);
        },
        instances(): ObjectMap<ServiceInstance> {
            return this.store.state.instances;
        },
    },
    methods: {
        getServiceInstances(serviceType: string) {
            return filterObjectMap(this.instances, (instance) => instance.serviceType === serviceType);
        },
    },
});
</script>

<style>
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

.bundle-dependencies {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.dependency-type {
    padding: 4px;
    padding-left: 0;
}
</style>
