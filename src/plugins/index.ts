/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from "./vuetify";
import i18n from "../i18n";
import router from "../router";
import { VueFire } from "vuefire";
import { firebaseApp } from "../firebase";
import { createPinia } from "pinia";

// Types
import type { App } from "vue";

export function registerPlugins(app: App) {
  app.use(vuetify);
  app.use(i18n);
  app.use(router);
  app.use(createPinia());
  app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [],
  });
}
