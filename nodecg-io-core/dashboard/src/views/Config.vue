<template>
    <div class="container">
        <p>todo: Tabs or split screen?</p>
        <ServiceGrid />
    </div>
</template>

<script lang="ts">
import ServiceGrid from "@/components/services/ServiceGrid.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppConfig",
    components: {
        ServiceGrid,
    },
    setup() {
        return {};
    },
});
</script>
