<template>
  <v-app>
    <v-navigation-drawer
      v-if="isLoggedIn"
      permanent
      width="280"
      color="surface"
      class="border-e"
    >
      <v-list-item
        :prepend-avatar="userProfile.avatar"
        :title="userProfile.username"
        :subtitle="userProfile.email"
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
        <v-icon class="me-2" size="32">mdi-robot</v-icon>
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
        @click="logout"
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
import { ref, computed, onMounted, watch } from "vue";
import { useTheme } from "vuetify";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import AuthForm from "../components/AuthForm.vue";
import Dashboard from "../components/Dashboard.vue";
import { useAuthStore } from "../stores/auth";
import { signOutUser } from "../firebase/auth";

// Router
const router = useRouter();

// Auth store
const authStore = useAuthStore();

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

// Authentication state (using auth store)
// const isLoggedIn = computed(() => authStore.isAuthenticated);
const isLoggedIn = ref(true);
const userProfile = computed(() => ({
  username: authStore.userDisplayName,
  email: authStore.userEmail,
  avatar:
    authStore.userPhotoURL || "https://randomuser.me/api/portraits/men/85.jpg",
}));

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
  { title: "nav.streamTools", icon: "mdi-video", value: "tools" },
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

const logout = async () => {
  try {
    await signOutUser();
    await authStore.logout();
    selectedMenuItem.value = "overview";
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Initialize auth store on mount
onMounted(() => {
  authStore.initializeAuth();
});
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
