<template>
    <div class="dashboard-container">
        <v-tabs v-if="small" v-model="activeTab" class="dashboard-tabs" background-color="secondary">
            <v-tab value="services" class="dashboard-tab">Services</v-tab>
            <v-tab value="bundles" class="dashboard-tab">Bundles</v-tab>
        </v-tabs>
        <div class="dashboard-container-content">
            <div v-show="!small || activeTab === 'services'" class="dashboard-content">
                <ServiceGrid />
            </div>
            <div v-if="!small" class="spacer"></div>
            <div v-show="!small || activeTab === 'bundles'" class="dashboard-content">
                <BundleGrid />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import BundleGrid from "@/components/bundles/BundleGrid.vue";
import ServiceGrid from "@/components/services/ServiceGrid.vue";
import { defineComponent } from "vue";
import { useDisplay } from "vuetify";

export default defineComponent({
    name: "AppDashboard",
    components: {
        BundleGrid,
        ServiceGrid,
    },
    setup() {
        const display = useDisplay();

        return {
            display,
        };
    },
    data() {
        return {
            small: false,
            activeTab: "services" as "services" | "bundles",
        };
    },
    mounted() {
        window.addEventListener("resize", this.updateLayout, { passive: true });
        this.updateLayout();
    },
    unmounted() {
        window.removeEventListener("resize", this.updateLayout);
    },
    methods: {
        updateLayout() {
            this.small = this.display.smAndDown.value;
        },
    },
});
</script>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
}

.dashboard-tabs {
    flex: 0;
}

.dashboard-tab {
    width: 50%;
    max-width: 50%;
}

.dashboard-container-content {
    display: flex;
    flex: 1;
    max-height: 100%;
    overflow: auto;
}

.dashboard-content {
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
