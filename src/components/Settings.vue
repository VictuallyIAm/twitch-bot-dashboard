<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ $t("settings.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("settings.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-robot</v-icon>
            {{ $t("settings.botConfiguration") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="botSettings.username"
              :label="$t('settings.botUsername')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="botSettings.prefix"
              :label="$t('settings.commandPrefix')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="botSettings.channel"
              :label="$t('settings.twitchChannel')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-switch
              v-model="botSettings.autoConnect"
              :label="$t('settings.autoConnectOnStartup')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveBotSettings"
              :loading="savingBot"
              :disabled="!hasChanges.bot"
              block
            >
              {{ $t("settings.saveBotSettings") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-palette</v-icon>
            {{ $t("settings.appearance") }}
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="appearanceSettings.theme"
              :label="$t('settings.theme')"
              :items="themeOptions"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-select
              v-model="appearanceSettings.language"
              :label="$t('settings.language')"
              :items="languageOptions"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveAppearanceSettings"
              :loading="savingAppearance"
              :disabled="!hasChanges.appearance"
              block
            >
              {{ $t("settings.saveAppearanceSettings") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-bell</v-icon>
            {{ $t("settings.notifications") }}
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="notificationSettings.newFollowers"
              :label="$t('settings.newFollowers')"
              color="success"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="notificationSettings.donations"
              :label="$t('settings.donations')"
              color="warning"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="notificationSettings.subscriptions"
              :label="$t('settings.subscriptions')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="notificationSettings.moderationActions"
              :label="$t('settings.moderationActions')"
              color="error"
              class="mb-4"
            ></v-switch>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveNotificationSettings"
              :loading="savingNotifications"
              :disabled="!hasChanges.notifications"
              block
            >
              {{ $t("settings.saveNotificationSettings") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-database</v-icon>
            {{ $t("settings.dataManagement") }}
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-3">
              <v-btn
                color="primary"
                prepend-icon="mdi-export"
                variant="outlined"
                @click="exportSettings"
                block
              >
                {{ $t("settings.exportSettings") }}
              </v-btn>

              <v-btn
                color="info"
                prepend-icon="mdi-import"
                variant="outlined"
                @click="importSettings"
                block
              >
                {{ $t("settings.importSettings") }}
              </v-btn>

              <v-btn
                color="warning"
                prepend-icon="mdi-restore"
                variant="outlined"
                @click="showResetDialog = true"
                block
              >
                {{ $t("settings.resetToDefaults") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Reset Confirmation Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ $t("settings.resetToDefaults") }}</v-card-title>
        <v-card-text>
          Are you sure you want to reset all settings to their default values?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showResetDialog = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="warning" @click="resetToDefaults">
            {{ $t("common.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccessSnackbar" color="success" timeout="3000">
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSuccessSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showErrorSnackbar" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showErrorSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth";
import { botSettings as botSettingsAPI } from "../firebase/firestore";

const { t } = useI18n();
const authStore = useAuthStore();

// Data
const showResetDialog = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Loading states
const savingBot = ref(false);
const savingAppearance = ref(false);
const savingNotifications = ref(false);

// Original settings for change detection
const originalBotSettings = ref({});
const originalAppearanceSettings = ref({});
const originalNotificationSettings = ref({});

const botSettings = ref({
  username: "TwitchBot",
  prefix: "!",
  channel: "your_channel",
  autoConnect: true,
});

const appearanceSettings = ref({
  theme: "auto",
  language: "en",
});

const notificationSettings = ref({
  newFollowers: true,
  donations: true,
  subscriptions: true,
  moderationActions: false,
});

// Computed
const themeOptions = computed(() => [
  { title: t("settings.light"), value: "light" },
  { title: t("settings.dark"), value: "dark" },
  { title: t("settings.auto"), value: "auto" },
]);

const languageOptions = computed(() => [
  { title: t("settings.english"), value: "en" },
  { title: t("settings.russian"), value: "ru" },
]);

const hasChanges = computed(() => ({
  bot:
    JSON.stringify(botSettings.value) !==
    JSON.stringify(originalBotSettings.value),
  appearance:
    JSON.stringify(appearanceSettings.value) !==
    JSON.stringify(originalAppearanceSettings.value),
  notifications:
    JSON.stringify(notificationSettings.value) !==
    JSON.stringify(originalNotificationSettings.value),
}));

// Methods
const loadSettings = async () => {
  if (!authStore.user) return;

  try {
    const settings = await botSettingsAPI.get();
    if (settings) {
      botSettings.value = { ...botSettings.value, ...settings };
      originalBotSettings.value = { ...botSettings.value };
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
};

const saveBotSettings = async () => {
  if (!authStore.user) return;

  savingBot.value = true;
  try {
    await botSettingsAPI.save(botSettings.value);
    originalBotSettings.value = { ...botSettings.value };
    successMessage.value = t("settings.botSettingsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving bot settings:", error);
    errorMessage.value = t("settings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingBot.value = false;
  }
};

const saveAppearanceSettings = async () => {
  savingAppearance.value = true;
  try {
    // Save to localStorage for appearance settings
    localStorage.setItem(
      "appearance",
      JSON.stringify(appearanceSettings.value)
    );
    originalAppearanceSettings.value = { ...appearanceSettings.value };
    successMessage.value = t("settings.appearanceSettingsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving appearance settings:", error);
    errorMessage.value = t("settings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingAppearance.value = false;
  }
};

const saveNotificationSettings = async () => {
  savingNotifications.value = true;
  try {
    // Save to localStorage for notification settings
    localStorage.setItem(
      "notifications",
      JSON.stringify(notificationSettings.value)
    );
    originalNotificationSettings.value = { ...notificationSettings.value };
    successMessage.value = t("settings.notificationSettingsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving notification settings:", error);
    errorMessage.value = t("settings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingNotifications.value = false;
  }
};

const exportSettings = () => {
  const settings = {
    bot: botSettings.value,
    appearance: appearanceSettings.value,
    notifications: notificationSettings.value,
  };

  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = "twitch-bot-settings.json";
  link.click();

  successMessage.value = t("settings.settingsExported");
  showSuccessSnackbar.value = true;
};

const importSettings = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const settings = JSON.parse(e.target.result);

          if (settings.bot)
            botSettings.value = { ...botSettings.value, ...settings.bot };
          if (settings.appearance)
            appearanceSettings.value = {
              ...appearanceSettings.value,
              ...settings.appearance,
            };
          if (settings.notifications)
            notificationSettings.value = {
              ...notificationSettings.value,
              ...settings.notifications,
            };

          successMessage.value = t("settings.settingsImported");
          showSuccessSnackbar.value = true;
        } catch (error) {
          console.error("Error importing settings:", error);
          errorMessage.value = t("settings.errorImportingSettings");
          showErrorSnackbar.value = true;
        }
      };
      reader.readAsText(file);
    }
  };

  input.click();
};

const resetToDefaults = () => {
  botSettings.value = {
    username: "TwitchBot",
    prefix: "!",
    channel: "your_channel",
    autoConnect: true,
  };

  appearanceSettings.value = {
    theme: "auto",
    language: "en",
  };

  notificationSettings.value = {
    newFollowers: true,
    donations: true,
    subscriptions: true,
    moderationActions: false,
  };

  showResetDialog.value = false;
  successMessage.value = t("settings.settingsReset");
  showSuccessSnackbar.value = true;
};

// Load settings on mount
onMounted(() => {
  loadSettings();

  // Load appearance settings from localStorage
  const savedAppearance = localStorage.getItem("appearance");
  if (savedAppearance) {
    appearanceSettings.value = {
      ...appearanceSettings.value,
      ...JSON.parse(savedAppearance),
    };
    originalAppearanceSettings.value = { ...appearanceSettings.value };
  }

  // Load notification settings from localStorage
  const savedNotifications = localStorage.getItem("notifications");
  if (savedNotifications) {
    notificationSettings.value = {
      ...notificationSettings.value,
      ...JSON.parse(savedNotifications),
    };
    originalNotificationSettings.value = { ...notificationSettings.value };
  }
});

// Watch for auth changes
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      loadSettings();
    }
  }
);
</script>

<style lang="scss" scoped>
.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.gap-3 {
  gap: 12px;
}

.v-switch {
  .v-selection-control__wrapper {
    margin-right: 8px;
  }
}
</style>
