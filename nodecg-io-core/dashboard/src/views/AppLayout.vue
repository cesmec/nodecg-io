<script setup lang="ts">
import BundleGrid from "@/components/bundles/BundleGrid.vue";
import ServiceGrid from "@/components/services/ServiceGrid.vue";
import { ref } from "vue";
import { useDisplay } from "vuetify";

const enum Tab {
    Services = "services",
    Bundles = "bundles",
}

const activeTab = ref(Tab.Services);

const { mdAndUp } = useDisplay();
</script>

<template>
    <div class="layout-container">
        <v-tabs v-if="!mdAndUp" v-model="activeTab" class="layout-tabs">
            <v-tab :value="Tab.Services" class="layout-tab">Services</v-tab>
            <v-tab :value="Tab.Bundles" class="layout-tab">Bundles</v-tab>
        </v-tabs>
        <div class="layout-container-content">
            <div v-show="mdAndUp || activeTab === Tab.Services" class="layout-content">
                <ServiceGrid />
            </div>
            <div v-if="mdAndUp" class="spacer"></div>
            <div v-show="mdAndUp || activeTab === Tab.Bundles" class="layout-content">
                <BundleGrid />
            </div>
        </div>
    </div>
</template>

<style scoped>
.layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
}

.layout-tabs {
    flex: 0;
}

.layout-tab {
    width: 50%;
    max-width: 50%;
}

.layout-container-content {
    display: flex;
    flex: 1;
    max-height: 100%;
    overflow: auto;
}

.layout-content {
    flex: 1;
    padding: 10px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.spacer {
    height: 100%;
    width: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.75);
}
</style>
