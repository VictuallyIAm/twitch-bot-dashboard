import { createI18n } from "vue-i18n";
import en from "./locales/en";
import ru from "./locales/ru";

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem("language") || "en";

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: "en",
  messages: {
    en,
    ru,
  },
});

export default i18n;
