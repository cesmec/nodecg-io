<template>
    <v-app>
        <v-main>
            <Auth />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Auth from "@/views/Auth.vue";
import "@/assets/global.css";

export default defineComponent({
    name: "App",
    components: {
        Auth,
    },
});
</script>
