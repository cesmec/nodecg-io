<template>
    <div class="container">
        <p>todo: Tabs or split screen?</p>
        <Services />
    </div>
</template>

<script lang="ts">
import Services from "@/components/services/Services.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "nodecg-io-config",
    components: {
        Services,
    },
    setup() {
        return {};
    },
});
</script>
