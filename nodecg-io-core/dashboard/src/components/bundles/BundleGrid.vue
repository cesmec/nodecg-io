<script setup lang="ts">
import BundleDependency from "@/components/bundles/BundleDependency.vue";
import { useStore } from "@/store";
import { updateBundleDependency } from "@/utils/bundles";
import { computed, ref } from "vue";

const search = ref("");

const store = useStore();

const filteredBundles = computed(() => store.filterBundles(search.value));
</script>

<template>
    <h1>Bundles</h1>
    <v-text-field v-model="search" class="grid-view-search" label="Search" clearable></v-text-field>
    <div class="grid-view-container">
        <v-card v-for="(bundle, name) in filteredBundles" :key="name" :class="{ bundle: true, active: bundle.active }">
            <v-card-title class="bundle-title">
                <span class="ellipsis">{{ name }}</span>
            </v-card-title>
            <v-card-text>
                <div class="bundle-dependencies">
                    <BundleDependency
                        v-for="dep in bundle.dependencies"
                        :key="dep.serviceType"
                        :dependency="dep"
                        @update="(value) => updateBundleDependency(name, dep, value)"
                    />
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<style>
.bundle {
    margin: 10px;
    opacity: 0.75;
    min-height: 100px;
    height: min-content;
    min-width: 200px;
    max-width: 300px;
}

.bundle.active {
    opacity: 1;
}

.bundle-title {
    margin-bottom: 0;
}

.bundle-dependencies {
    display: flex;
    flex-direction: column;
}
</style>
