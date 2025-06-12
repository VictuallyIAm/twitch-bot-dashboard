<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ $t("moderation.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("moderation.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-shield-check</v-icon>
            {{ $t("moderation.autoModeration") }}
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="moderationSettings.autoModerationEnabled"
              :label="$t('moderation.enableAutoModeration')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="moderationSettings.blockLinks"
              :label="$t('moderation.blockLinks')"
              color="warning"
              :disabled="!moderationSettings.autoModerationEnabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="moderationSettings.capsFilter"
              :label="$t('moderation.capsFilter')"
              color="warning"
              :disabled="!moderationSettings.autoModerationEnabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="moderationSettings.symbolSpamFilter"
              :label="$t('moderation.symbolSpamFilter')"
              color="warning"
              :disabled="!moderationSettings.autoModerationEnabled"
              class="mb-4"
            ></v-switch>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveModerationSettings"
              :loading="savingModeration"
              :disabled="!hasChanges.moderation"
              block
            >
              {{ $t("moderation.saveModerationSettings") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-speedometer</v-icon>
            {{ $t("moderation.chatLimits") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model.number="chatLimits.slowModeSeconds"
              :label="$t('moderation.slowModeSeconds')"
              type="number"
              variant="outlined"
              min="0"
              max="300"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="chatLimits.maxMessageLength"
              :label="$t('moderation.maxMessageLength')"
              type="number"
              variant="outlined"
              min="10"
              max="500"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="chatLimits.followersOnlyMinutes"
              :label="$t('moderation.followersOnlyMinutes')"
              type="number"
              variant="outlined"
              min="0"
              max="10080"
              class="mb-4"
            ></v-text-field>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveChatLimits"
              :loading="savingLimits"
              :disabled="!hasChanges.limits"
              block
            >
              {{ $t("moderation.saveChatLimits") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-cancel</v-icon>
            {{ $t("moderation.bannedWords") }}
          </v-card-title>
          <v-card-text>
            <div class="d-flex mb-4">
              <v-text-field
                v-model="newBannedWord"
                :label="$t('moderation.wordToBan')"
                variant="outlined"
                hide-details
                class="me-2"
                @keyup.enter="addBannedWord"
              ></v-text-field>
              <v-btn
                color="primary"
                @click="addBannedWord"
                :disabled="!newBannedWord.trim()"
              >
                {{ $t("moderation.addWord") }}
              </v-btn>
            </div>

            <div
              v-if="bannedWords.length === 0"
              class="text-center text-medium-emphasis py-4"
            >
              <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
              <p>{{ $t("moderation.noBannedWords") }}</p>
            </div>

            <div v-else class="mb-4">
              <v-chip
                v-for="word in bannedWords"
                :key="word"
                closable
                @click:close="removeBannedWord(word)"
                class="me-2 mb-2"
                color="error"
                variant="outlined"
              >
                {{ word }}
              </v-chip>
            </div>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveBannedWords"
              :loading="savingWords"
              :disabled="!hasChanges.words"
              block
            >
              {{ $t("moderation.saveBannedWords") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-history</v-icon>
            {{ $t("moderation.recentActions") }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="action in recentActions"
                :key="action.id"
                :prepend-icon="action.icon"
                :title="action.action"
                :subtitle="action.details"
              >
                <template v-slot:append>
                  <span class="text-caption text-medium-emphasis">
                    {{ action.timestamp }}
                  </span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Banned Word Dialog -->
    <v-dialog v-model="showAddWordDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ $t("moderation.addBannedWord") }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newBannedWord"
            :label="$t('moderation.wordToBan')"
            variant="outlined"
            autofocus
            @keyup.enter="addBannedWord"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showAddWordDialog = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="addBannedWord"
            :disabled="!newBannedWord.trim()"
          >
            {{ $t("common.add") }}
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
import { moderationSettings as moderationSettingsAPI } from "../firebase/firestore";

const { t } = useI18n();
const authStore = useAuthStore();

// Data
const showAddWordDialog = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Loading states
const savingModeration = ref(false);
const savingLimits = ref(false);
const savingWords = ref(false);

// Original settings for change detection
const originalModerationSettings = ref({});
const originalChatLimits = ref({});
const originalBannedWords = ref<string[]>([]);

const moderationSettings = ref({
  autoModerationEnabled: true,
  blockLinks: true,
  capsFilter: true,
  symbolSpamFilter: false,
});

const chatLimits = ref({
  slowModeSeconds: 0,
  maxMessageLength: 500,
  followersOnlyMinutes: 0,
});

const newBannedWord = ref("");
const bannedWords = ref(["spam", "toxic", "hate"]);

const recentActions = ref([
  {
    id: 1,
    icon: "mdi-delete",
    action: "Message deleted",
    details: "Spam message from user123",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    icon: "mdi-account-cancel",
    action: "User timed out",
    details: "ToxicUser - 10 minutes",
    timestamp: "5 min ago",
  },
  {
    id: 3,
    icon: "mdi-link-off",
    action: "Link blocked",
    details: "Suspicious link from newuser",
    timestamp: "8 min ago",
  },
  {
    id: 4,
    icon: "mdi-format-letter-case",
    action: "Caps message filtered",
    details: "ALL CAPS MESSAGE removed",
    timestamp: "12 min ago",
  },
  {
    id: 5,
    icon: "mdi-shield-check",
    action: "Auto-moderation enabled",
    details: "All filters activated",
    timestamp: "1 hour ago",
  },
]);

// Computed
const hasChanges = computed(() => ({
  moderation:
    JSON.stringify(moderationSettings.value) !==
    JSON.stringify(originalModerationSettings.value),
  limits:
    JSON.stringify(chatLimits.value) !==
    JSON.stringify(originalChatLimits.value),
  words:
    JSON.stringify(bannedWords.value) !==
    JSON.stringify(originalBannedWords.value),
}));

// Methods
const loadModerationSettings = async () => {
  if (!authStore.user) return;

  try {
    const settings = await moderationSettingsAPI.get();
    if (settings) {
      moderationSettings.value = { ...moderationSettings.value, ...settings };
      originalModerationSettings.value = { ...moderationSettings.value };

      if (settings.slowMode !== undefined) {
        chatLimits.value.slowModeSeconds = settings.slowMode;
      }
      if (settings.maxMessageLength !== undefined) {
        chatLimits.value.maxMessageLength = settings.maxMessageLength;
      }
      if (settings.followersOnly !== undefined) {
        chatLimits.value.followersOnlyMinutes = settings.followersOnly;
      }
      originalChatLimits.value = { ...chatLimits.value };

      if (settings.bannedWords && Array.isArray(settings.bannedWords)) {
        bannedWords.value = [...settings.bannedWords];
        originalBannedWords.value = [...settings.bannedWords];
      }
    }
  } catch (error) {
    console.error("Error loading moderation settings:", error);
  }
};

const saveModerationSettings = async () => {
  if (!authStore.user) return;

  savingModeration.value = true;
  try {
    await moderationSettingsAPI.save({
      autoModeration: moderationSettings.value.autoModerationEnabled,
      blockLinks: moderationSettings.value.blockLinks,
      capsFilter: moderationSettings.value.capsFilter,
      symbolSpamFilter: moderationSettings.value.symbolSpamFilter,
      slowMode: chatLimits.value.slowModeSeconds,
      maxMessageLength: chatLimits.value.maxMessageLength,
      followersOnly: chatLimits.value.followersOnlyMinutes,
      bannedWords: bannedWords.value,
    });
    originalModerationSettings.value = { ...moderationSettings.value };
    successMessage.value = t("moderation.moderationSettingsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving moderation settings:", error);
    errorMessage.value = t("moderation.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingModeration.value = false;
  }
};

const saveChatLimits = async () => {
  if (!authStore.user) return;

  savingLimits.value = true;
  try {
    await moderationSettingsAPI.save({
      autoModeration: moderationSettings.value.autoModerationEnabled,
      blockLinks: moderationSettings.value.blockLinks,
      capsFilter: moderationSettings.value.capsFilter,
      symbolSpamFilter: moderationSettings.value.symbolSpamFilter,
      slowMode: chatLimits.value.slowModeSeconds,
      maxMessageLength: chatLimits.value.maxMessageLength,
      followersOnly: chatLimits.value.followersOnlyMinutes,
      bannedWords: bannedWords.value,
    });
    originalChatLimits.value = { ...chatLimits.value };
    successMessage.value = t("moderation.chatLimitsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving chat limits:", error);
    errorMessage.value = t("moderation.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingLimits.value = false;
  }
};

const saveBannedWords = async () => {
  if (!authStore.user) return;

  savingWords.value = true;
  try {
    await moderationSettingsAPI.save({
      autoModeration: moderationSettings.value.autoModerationEnabled,
      blockLinks: moderationSettings.value.blockLinks,
      capsFilter: moderationSettings.value.capsFilter,
      symbolSpamFilter: moderationSettings.value.symbolSpamFilter,
      slowMode: chatLimits.value.slowModeSeconds,
      maxMessageLength: chatLimits.value.maxMessageLength,
      followersOnly: chatLimits.value.followersOnlyMinutes,
      bannedWords: bannedWords.value,
    });
    originalBannedWords.value = [...bannedWords.value];
    successMessage.value = t("moderation.bannedWordsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving banned words:", error);
    errorMessage.value = t("moderation.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingWords.value = false;
  }
};

const addBannedWord = () => {
  const word = newBannedWord.value.trim().toLowerCase();
  if (word && !bannedWords.value.includes(word)) {
    bannedWords.value.push(word);
    newBannedWord.value = "";
    showAddWordDialog.value = false;
  }
};

const removeBannedWord = (word: string) => {
  const index = bannedWords.value.indexOf(word);
  if (index > -1) {
    bannedWords.value.splice(index, 1);
  }
};

// Load settings on mount
onMounted(() => {
  loadModerationSettings();
});

// Watch for auth changes
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      loadModerationSettings();
    }
  }
);
</script>

<style lang="scss" scoped>
.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-switch {
  .v-selection-control__wrapper {
    margin-right: 8px;
  }
}

.v-chip {
  font-weight: 500;
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
