<template>
  <v-app>
    <v-navigation-drawer
      v-if="isLoggedIn"
      v-model="drawer"
      width="280"
      color="surface"
      class="border-e"
    >
      <v-list-item
        :prepend-avatar="user?.profile_image_url ?? ''"
        :title="user?.display_name ?? ''"
        :subtitle="user?.email ?? ''"
        nav
        class="pa-4"
      >
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="$t(item.title)"
          :value="item.value"
          @click="selectedMenuItem = item.value"
          :active="selectedMenuItem === item.value"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar :elevation="2" color="primary" dark>
      <v-toolbar-title class="d-flex align-center">
        <v-icon class="me-2" size="32" v-if="$vuetify.display.mdAndUp">mdi-robot</v-icon>
        <v-icon class="me-2" size="32" @click="drawer = !drawer" v-else>mdi-reorder-horizontal</v-icon>
        <span class="text-h5 font-weight-bold">{{
          $t("dashboard.title")
        }}</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-select
        v-model="currentLanguage"
        :items="languageOptions"
        variant="outlined"
        density="compact"
        hide-details
        class="me-3"
        style="max-width: 150px"
        @update:model-value="changeLanguage"
      >
        <template v-slot:prepend-inner>
          <v-icon size="20">mdi-translate</v-icon>
        </template>
      </v-select>

      <v-btn icon @click="toggleTheme" variant="text">
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>

      <v-btn
        v-if="isLoggedIn"
        icon
        @click=""
        variant="text"
        :title="$t('nav.logout')"
      >
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container v-if="!isLoggedIn" fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <AuthForm />
          </v-col>
        </v-row>
      </v-container>

      <v-container v-else fluid>
        <Dashboard :selected-menu="selectedMenuItem" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useTheme } from "vuetify";
import { useI18n } from "vue-i18n";
import AuthForm from "../components/AuthForm.vue";
import Dashboard from "../components/Dashboard.vue";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

// Internationalization
const { locale } = useI18n();
const currentLanguage = ref(locale.value);

// Theme management
const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);
const themeIcon = computed(() =>
  isDark.value ? "mdi-weather-sunny" : "mdi-weather-night"
);

// Navigation
const selectedMenuItem = ref("overview");
const drawer = ref(true);

const { isLoggedIn, user } = storeToRefs(useUserStore());

// Language options
const languageOptions = [
  { title: "English", value: "en" },
  { title: "Русский", value: "ru" },
];

// Menu items
const menuItems = [
  { title: "nav.overview", icon: "mdi-view-dashboard", value: "overview" },
  { title: "nav.botCommands", icon: "mdi-robot", value: "commands" },
  {
    title: "nav.chatModeration",
    icon: "mdi-shield-account",
    value: "moderation",
  },
  { title: "nav.analytics", icon: "mdi-chart-line", value: "analytics" },
  // { title: "nav.streamTools", icon: "mdi-video", value: "tools" },
  { title: "nav.aiSettings", icon: "mdi-brain", value: "ai-settings" },
  { title: "nav.settings", icon: "mdi-cog", value: "settings" },
];

// Methods
const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
};

const changeLanguage = (newLanguage: string) => {
  locale.value = newLanguage;
  localStorage.setItem("language", newLanguage);
};
</script>

<style lang="scss" scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-app-bar {
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14),
    0 1px 10px 0 rgba(0, 0, 0, 0.12);
}
</style>
