import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { injectionKey, store } from "./store";

loadFonts();

createApp(App).use(vuetify).provide(injectionKey, store).mount("#app");
