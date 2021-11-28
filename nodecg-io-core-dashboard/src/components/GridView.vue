<template>
    <div class="grid-view-container">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "grid-view",
});
</script>

<style>
.grid-view-container {
    max-height: 100%;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
}
</style>
