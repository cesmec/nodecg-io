<template>
    <div class="container">
        <p>todo: Tabs or split screen?</p>
        <Services />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Services from "@/components/service/Services.vue";

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
