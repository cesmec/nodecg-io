<template>
    <v-app>
        <v-main>
            <Auth />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import "@/assets/global.css";
import Auth from "@/views/Auth.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "App",
    components: {
        Auth,
    },
});
</script>
