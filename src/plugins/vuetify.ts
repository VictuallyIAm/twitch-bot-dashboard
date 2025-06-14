/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: {
    VSwitch: {
      hideDetails: true,
    },
    VTextField: {
      hideDetails: true,
      density: "compact",
    },
    VSelect: {
      hideDetails: true,
      density: "compact",
    },
  },
  theme: {
    defaultTheme: "dark",
    themes: {
      light: {
        colors: {
          primary: "#9146FF", // Twitch purple
          secondary: "#772CE8",
          accent: "#00F5FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#00F593",
          warning: "#FF9500",
          surface: "#FFFFFF",
          background: "#F7F8FA",
        },
      },
      dark: {
        colors: {
          primary: "#9146FF", // Twitch purple
          secondary: "#772CE8",
          accent: "#00F5FF",
          error: "#FF5252",
          info: "#2196F3",
          success: "#00F593",
          warning: "#FF9500",
          surface: "#18181B",
          background: "#0E0E10",
        },
      },
    },
  },
});
