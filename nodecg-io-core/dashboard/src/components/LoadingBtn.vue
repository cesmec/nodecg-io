<script lang="tsx">
import { defineComponent } from "vue";
import { VBtn, VProgressCircular } from "vuetify/lib/components";

export default defineComponent({
    name: "LoadingBtn",
    props: {
        color: String,
        loading: Boolean,
        disabled: Boolean,
    },
    setup(props, { attrs, slots }) {
        return () => {
            return (
                <VBtn {...attrs} {...props} disabled={props.disabled || props.loading}>
                    {props.loading ? (
                        <VProgressCircular class="btn-progress" indeterminate color={props.color} />
                    ) : (
                        slots.default?.()
                    )}
                </VBtn>
            );
        };
    },
});
</script>

<style scoped>
button {
    position: relative;
}

.btn-progress {
    position: absolute;
}
</style>
