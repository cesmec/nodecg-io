<template>
    <div class="dashboard-container">
        <div class="dashboard-content">
            <Services />
        </div>
        <div class="spacer"></div>
        <div class="dashboard-content">
            <Bundles />
        </div>
    </div>
</template>

<script lang="ts">
import Bundles from "@/components/bundles/Bundles.vue";
import Services from "@/components/services/Services.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "nodecg-io-dashboard",
    components: {
        Bundles,
        Services,
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
