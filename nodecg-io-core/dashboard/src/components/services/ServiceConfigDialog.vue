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
        <div v-show="hasConfig" ref="editorContainer" class="editor-container"></div>
        <div v-if="!hasConfig" ref="emptyConfig" class="empty-config">Nothing to configure</div>
    </ConfirmDialog>
</template>

<script lang="ts">
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { objectDeepCopy } from "@/utils/objectUtils";
import { updateServiceInstanceConfig } from "@/utils/services";
import { ObjectMap, Service, ServiceInstance } from "@/utils/types";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { defineComponent, nextTick, ref } from "vue";

// The monaco editor works better when it's not inside a vue Proxy object.
// But doing it this way limits it to only one instance which will be reused.
let editor: monaco.editor.IStandaloneCodeEditor | undefined = undefined;

export default defineComponent({
    name: "ServiceConfigDialog",
    components: {
        ConfirmDialog,
    },
    setup() {
        return {
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

            // wait one update cycle before accessing dom refs
            nextTick(() => {
                if (this.editorContainer) {
                    // manage monaco editor element manually instead of letting vue handle it
                    this.editorElement ??= document.createElement("div");
                    this.editorContainer.appendChild(this.editorElement);
                    this.updateEditor(this.editorElement);
                    this.setHeightToAvailable();
                }
            });
        },
        async save() {
            this.config = editor?.getValue() ?? "";
            try {
                const config = JSON.parse(this.config);
                await updateServiceInstanceConfig(this.instanceName, config);
                return true;
            } catch (error) {
                console.log("config save failed", error);
                return error instanceof Error ? error.message : String(error);
            }
        },
        /**
         * Initializes the editor if needed and creates a new textmodel for the configuration of the service instance.
         * @param element Root element of the editor if it needs to be created
         */
        updateEditor(element: HTMLElement) {
            editor?.getModel()?.dispose();

            // This model uri can be completely made up as long the uri in the schema matches with the one in the language model.
            const modelUri = monaco.Uri.parse(`mem://nodecg-io/selectedServiceSchema.json`);

            const options = this.getServiceDiagnosticsOptions(modelUri.toString());
            monaco.languages.json.jsonDefaults.setDiagnosticsOptions(options);

            const model = monaco.editor.createModel(this.config, "json", options.validate ? modelUri : undefined);
            if (!editor) {
                editor = monaco.editor.create(element, {
                    theme: "vs-dark",
                    model,
                });
            } else {
                editor.setModel(model);
            }
            editor.layout();
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
                    editor?.layout();
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
</style>
