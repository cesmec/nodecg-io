<script setup lang="ts">
import { useStoreState } from "@/store";
import AppLayout from "@/views/AppLayout.vue";
import AppLogin from "@/views/AppLogin.vue";

const { loggedIn } = useStoreState();
</script>

<template>
    <div class="auth-container">
        <transition name="fade">
            <template v-if="loggedIn">
                <AppLayout />
            </template>
            <template v-else>
                <AppLogin />
            </template>
        </transition>
    </div>
</template>

<style>
.auth-container {
    position: relative;
    width: 100vw;
    height: 100vh;
}

.auth-container > * {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
