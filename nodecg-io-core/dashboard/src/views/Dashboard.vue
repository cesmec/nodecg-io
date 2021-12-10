<template>
    <div class="dashboard-container">
        <template v-if="small">
            <div class="dashboard-content">
                <v-btn
                    @click="activeTab = activeTab === 'services' ? 'bundles' : 'services'"
                    style="position: absolute; right: 5px"
                    >Switch Tab</v-btn
                >
                <ServiceGrid v-if="activeTab === 'services'" />
                <BundleGrid v-else />
            </div>
        </template>
        <template v-else>
            <div class="dashboard-content">
                <ServiceGrid />
            </div>
            <div class="spacer"></div>
            <div class="dashboard-content">
                <BundleGrid />
            </div>
        </template>
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
    height: 100vh;
    width: 100vw;
}

.dashboard-content {
    flex: 1;
    padding: 10px;
    position: relative;
}

.spacer {
    height: 100%;
    width: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.75);
}
</style>
