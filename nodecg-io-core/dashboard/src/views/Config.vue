<template>
    <div class="container">
        <p>todo: Tabs?</p>
        <ServiceGrid />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ServiceGrid from "@/components/ServiceGrid.vue";

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
