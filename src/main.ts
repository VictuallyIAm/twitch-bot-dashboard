/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
import i18n from "./i18n";
import router from "./router";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Styles
import "unfonts.css";

const app = createApp(App);

registerPlugins(app);
app.use(i18n);
app.use(router);

app.mount("#app");
