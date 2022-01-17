<template>
    <div class="auth-container">
        <transition name="fade">
            <template v-if="loggedIn">
                <Dashboard />
            </template>
            <template v-else>
                <Login />
            </template>
        </transition>
    </div>
</template>

<script lang="ts">
import { useStore } from "@/store";
import Dashboard from "@/views/Dashboard.vue";
import Login from "@/views/Login.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "AppAuth",
    components: {
        Login,
        Dashboard,
    },
    setup() {
        return {
            store: useStore(),
        };
    },
    computed: {
        loggedIn(): boolean {
            return this.store.state.loggedIn;
        },
    },
});
</script>

<style>
.auth-container {
    position: relative;
    width: 100%;
    height: 100%;
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
