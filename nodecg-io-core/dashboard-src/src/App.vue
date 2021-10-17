<template>
    <v-app>
        <v-main>
            <Dashboard />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Dashboard from "@/views/Dashboard.vue";
import "@/assets/global.css";

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
