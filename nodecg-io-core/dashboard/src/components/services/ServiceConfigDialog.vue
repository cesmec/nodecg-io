<template>
    <ConfirmDialog
        ref="dialog"
        fullscreen
        canConfirmWithCtrlS
        confirmText="Save"
        :confirmDisabled="!hasConfig"
        class="config-dialog"
        @close="onClose"
    >
        <template v-slot:subtitle>
            <span>{{ serviceType }}</span>
        </template>
        <div v-show="hasConfig" ref="editorContainer" class="editor-container">
            <v-progress-circular
                v-if="!editorLoaded"
                class="editor-progress"
                indeterminate
                :size="50"
                color="secondary"
            ></v-progress-circular>
        </div>
        <div v-if="!hasConfig" ref="emptyConfig" class="empty-config">Nothing to configure</div>
    </ConfirmDialog>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { objectDeepCopy } from "@/utils/objectUtils";
import { updateServiceInstanceConfig } from "@/utils/services";
import { ObjectMap, Service, ServiceInstance } from "@/utils/types";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api"; // Types only, chunk is loaded later
import { defineComponent, nextTick, ref, shallowRef } from "vue";

export default defineComponent({
    name: "ServiceConfigDialog",
    components: {
        ConfirmDialog,
    },
    setup() {
        return {
            // Shallow ref, because the editor should not be reactive and wrapped in a Vue.js Proxy.
            editor: shallowRef<monaco.editor.IStandaloneCodeEditor>(),
            editorContainer: ref<HTMLElement>(),
            editorElement: ref<HTMLElement>(),
            emptyConfig: ref<HTMLElement>(),
            dialog: ref<InstanceType<typeof ConfirmDialog>>(),
        };
    },
    data() {
        return {
            instanceName: "",
            serviceType: "",
            config: "",
            editorLoaded: false,
            schema: undefined as ObjectMap<unknown> | undefined,
            observer: undefined as ResizeObserver | undefined,
        };
    },
    computed: {
        hasConfig(): boolean {
            return Boolean(this.schema);
        },
    },
    methods: {
        show(instanceName: string, instance: ServiceInstance, service: Service) {
            this.instanceName = instanceName;
            this.serviceType = instance.serviceType;
            this.config = JSON.stringify(instance.config, null, 4);
            this.schema = service.schema;

            this.dialog?.show(this.save, "Configure " + instanceName);

            // Wait one update cycle before accessing dom refs.
            nextTick(() => {
                this.setHeightToAvailable();
                if (this.editorContainer && this.hasConfig) {
                    // Manage monaco editor element manually instead of letting vue handle it.
                    this.editorElement ??= document.createElement("div");
                    this.editorContainer.appendChild(this.editorElement);
                    this.updateEditor(this.editorElement);
                }
            });
        },
        async save() {
            this.config = this.editor?.getValue() ?? "";
            try {
                const config = JSON.parse(this.config);
                await updateServiceInstanceConfig(this.instanceName, config);
                return true;
            } catch (error) {
                return error instanceof Error ? error.message : String(error);
            }
        },
        /**
         * Initializes the editor if needed and creates a new textmodel for the configuration of the service instance.
         * @param element Root element of the editor if it needs to be created
         */
        async updateEditor(element: HTMLElement) {
            this.editor?.getModel()?.dispose();

            const { Uri, languages, editor } = await import(
                /* webpackPrefetch: true, webpackChunkName: "monaco-editor" */
                "monaco-editor/esm/vs/editor/editor.api"
            );
            this.editorLoaded = true;

            // This model uri can be completely made up as long the uri in the schema matches with the one in the language model.
            const modelUri = Uri.parse(`mem://nodecg-io/selectedServiceSchema.json`);

            const options = this.getServiceDiagnosticsOptions(modelUri.toString());
            languages.json.jsonDefaults.setDiagnosticsOptions(options);

            const model = editor.createModel(this.config, "json", options.validate ? modelUri : undefined);
            if (!this.editor) {
                this.editor = editor.create(element, {
                    theme: "vs-dark",
                    model,
                });
            } else {
                this.editor.setModel(model);
            }
            this.editor.layout();
        },
        /**
         * Create json diagnostics options from the model url and json schema.
         */
        getServiceDiagnosticsOptions(modelUri: string): monaco.languages.json.DiagnosticsOptions {
            if (this.schema) {
                return {
                    validate: true,
                    schemas: [
                        {
                            uri: modelUri,
                            fileMatch: [modelUri],
                            schema: objectDeepCopy(this.schema),
                        },
                    ],
                };
            }
            // nothing to validate if there is no schema
            return {
                validate: false,
                schemas: [],
            };
        },
        /**
         * Start automatic resize of the editor to match available height.
         */
        setHeightToAvailable() {
            const cardTextElement = this.editorContainer?.parentElement;
            const cardElement = cardTextElement?.parentElement;
            if (!cardElement) return;

            const siblings = Array.from(cardElement.children).filter((e) => e !== cardTextElement);

            const calcSize = () => {
                const maxHeight = window.innerHeight;
                const siblingHeight = siblings.reduce((h, e) => h + e.clientHeight, 0);
                const availableHeight = maxHeight - siblingHeight;

                cardTextElement.style.height = `${availableHeight}px`;

                if (this.editorElement && this.editorElement.parentElement === this.editorContainer) {
                    this.editor?.layout();
                }
            };

            this.observer = new ResizeObserver(calcSize);
            this.observer.observe(cardElement);
            for (const sibling of siblings) {
                this.observer.observe(sibling);
            }
            calcSize();
        },
        onClose() {
            this.observer?.disconnect();
            this.observer = undefined;
        },
    },
});
</script>

<style>
.empty-config,
.editor-container,
.editor-container > * {
    width: 100%;
    height: 100%;
}

.empty-config {
    display: grid;
    place-items: center;
}

.config-dialog .v-card-text {
    opacity: 1;
}

.editor-container {
    position: relative;
}

.editor-progress {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
