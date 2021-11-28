<template>
    <div class="dashboard-container">
        <div class="dashboard-content">
            <ServiceGrid />
        </div>
        <div class="spacer"></div>
        <div class="dashboard-content">
            <BundleGrid />
        </div>
    </div>
</template>

<script lang="ts">
import BundleGrid from "@/components/bundles/BundleGrid.vue";
import ServiceGrid from "@/components/services/ServiceGrid.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppDashboard",
    components: {
        BundleGrid,
        ServiceGrid,
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
