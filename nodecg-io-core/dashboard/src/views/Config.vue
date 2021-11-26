<template>
    <div class="container">
        <p>todo: Tabs or split screen?</p>
        <ServiceGrid />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ServiceGrid from "@/components/service/ServiceGrid.vue";

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
