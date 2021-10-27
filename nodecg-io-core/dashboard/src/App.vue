<template>
    <v-app>
        <v-main>
            <Dashboard />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import "@/assets/global.css";
import Dashboard from "@/views/Dashboard.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "App",
    components: {
        Dashboard,
    },
    data() {
        return {
            //
        };
    },
});
</script>
