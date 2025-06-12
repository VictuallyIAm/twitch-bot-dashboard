<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ $t("aiSettings.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("aiSettings.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-brain</v-icon>
            {{ $t("aiSettings.aiConfiguration") }}
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="aiSettings.enabled"
              :label="$t('aiSettings.enableAi')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-select
              v-model="aiSettings.model"
              :label="$t('aiSettings.aiModel')"
              :items="aiModels"
              variant="outlined"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model="aiSettings.apiKey"
              :label="$t('aiSettings.openaiApiKey')"
              type="password"
              variant="outlined"
              :disabled="!aiSettings.enabled"
              :hint="$t('aiSettings.apiKeyHint')"
              persistent-hint
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="aiSettings.maxTokens"
              :label="$t('aiSettings.maxResponseTokens')"
              type="number"
              variant="outlined"
              min="50"
              max="500"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-text-field>

            <div class="mb-4">
              <v-label class="mb-2">{{
                $t("aiSettings.creativityLevel")
              }}</v-label>
              <v-slider
                v-model="aiSettings.temperature"
                min="0"
                max="1"
                step="0.1"
                :disabled="!aiSettings.enabled"
                thumb-label
                class="mb-2"
              ></v-slider>
              <p class="text-caption text-medium-emphasis">
                {{ $t("aiSettings.creativityHint") }}
              </p>
            </div>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveAiConfiguration"
              :loading="savingConfiguration"
              :disabled="!hasChanges.configuration"
              block
            >
              {{ $t("aiSettings.saveAiConfiguration") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-account-voice</v-icon>
            {{ $t("aiSettings.responseSettings") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model.number="responseSettings.cooldown"
              :label="$t('aiSettings.aiResponseCooldown')"
              type="number"
              variant="outlined"
              min="5"
              max="300"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-text-field>

            <v-switch
              v-model="responseSettings.moderatorOnly"
              :label="$t('aiSettings.moderatorOnlyTriggers')"
              color="warning"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="responseSettings.filterProfanity"
              :label="$t('aiSettings.filterProfanity')"
              color="error"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-switch>

            <v-text-field
              v-model="responseSettings.triggerWord"
              :label="$t('aiSettings.aiTriggerWord')"
              variant="outlined"
              :disabled="!aiSettings.enabled"
              :hint="$t('aiSettings.triggerWordHint')"
              persistent-hint
              class="mb-4"
            ></v-text-field>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="saveResponseSettings"
              :loading="savingResponse"
              :disabled="!hasChanges.response"
              block
            >
              {{ $t("aiSettings.saveResponseSettings") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-comedy</v-icon>
            {{ $t("aiSettings.personalitySettings") }}
          </v-card-title>
          <v-card-text>
            <div class="mb-4">
              <v-label class="mb-2">
                {{
                  $t("aiSettings.sarcasmLevel", {
                    level: personalitySettings.sarcasm,
                  })
                }}
                😏
              </v-label>
              <v-slider
                v-model="personalitySettings.sarcasm"
                min="0"
                max="100"
                step="5"
                :disabled="!aiSettings.enabled"
                thumb-label
                color="purple"
              ></v-slider>
            </div>

            <div class="mb-4">
              <v-label class="mb-2">
                {{
                  $t("aiSettings.humorLevel", {
                    level: personalitySettings.humor,
                  })
                }}
                😄
              </v-label>
              <v-slider
                v-model="personalitySettings.humor"
                min="0"
                max="100"
                step="5"
                :disabled="!aiSettings.enabled"
                thumb-label
                color="orange"
              ></v-slider>
            </div>

            <div class="mb-4">
              <v-label class="mb-2">
                {{
                  $t("aiSettings.friendliness", {
                    level: personalitySettings.friendliness,
                  })
                }}
                😊
              </v-label>
              <v-slider
                v-model="personalitySettings.friendliness"
                min="0"
                max="100"
                step="5"
                :disabled="!aiSettings.enabled"
                thumb-label
                color="green"
              ></v-slider>
            </div>

            <v-btn
              color="primary"
              prepend-icon="mdi-content-save"
              @click="savePersonalitySettings"
              :loading="savingPersonality"
              :disabled="!hasChanges.personality"
              block
            >
              {{ $t("aiSettings.savePersonalitySettings") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-script-text</v-icon>
            {{ $t("aiSettings.customSystemPrompt") }}
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="systemPrompt"
              :label="$t('aiSettings.systemPrompt')"
              variant="outlined"
              rows="8"
              :disabled="!aiSettings.enabled"
              :hint="$t('aiSettings.systemPromptHint')"
              persistent-hint
              class="mb-4"
            ></v-textarea>

            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                @click="saveSystemPrompt"
                :loading="savingPrompt"
                :disabled="!aiSettings.enabled || !hasChanges.prompt"
                flex
              >
                {{ $t("aiSettings.saveSystemPrompt") }}
              </v-btn>

              <v-btn
                variant="outlined"
                prepend-icon="mdi-restore"
                @click="resetPromptToDefault"
                :disabled="!aiSettings.enabled"
              >
                {{ $t("aiSettings.resetToDefaults") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="aiSettings.enabled">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-test-tube</v-icon>
            {{ $t("aiSettings.testAiResponse") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="testMessage"
              :label="$t('aiSettings.testMessage')"
              variant="outlined"
              :disabled="!aiSettings.enabled"
              class="mb-4"
              @keyup.enter="testAiResponse"
            ></v-text-field>

            <v-btn
              color="success"
              prepend-icon="mdi-play"
              @click="testAiResponse"
              :disabled="!aiSettings.enabled || !testMessage.trim()"
              :loading="testLoading"
              class="mb-4"
              block
            >
              {{ $t("aiSettings.testResponse") }}
            </v-btn>

            <v-card v-if="testResponse" variant="outlined" class="pa-4">
              <v-card-subtitle class="pa-0 mb-2">
                {{ $t("aiSettings.aiResponse") }}
              </v-card-subtitle>
              <p class="text-body-1">{{ testResponse }}</p>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import { aiSettings as aiSettingsAPI } from "../firebase/firestore";

const { t } = useI18n();
const authStore = useAuthStore();

// Data
const testMessage = ref("");
const testResponse = ref("");
const testLoading = ref(false);
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Loading states
const savingConfiguration = ref(false);
const savingResponse = ref(false);
const savingPersonality = ref(false);
const savingPrompt = ref(false);

// Original settings for change detection
const originalAiSettings = ref({});
const originalResponseSettings = ref({});
const originalPersonalitySettings = ref({});
const originalSystemPrompt = ref("");

const aiSettings = ref({
  enabled: false,
  model: "gpt-3.5-turbo",
  apiKey: "",
  maxTokens: 150,
  temperature: 0.7,
});

const responseSettings = ref({
  cooldown: 30,
  moderatorOnly: false,
  filterProfanity: true,
  triggerWord: "bot",
});

const personalitySettings = ref({
  sarcasm: 25,
  humor: 50,
  friendliness: 75,
});

const systemPrompt =
  ref(`You are a helpful and entertaining Twitch chat bot. Your role is to:

1. Engage with viewers in a friendly and welcoming manner
2. Answer questions about the stream and streamer
3. Provide helpful information when requested
4. Keep the chat positive and fun
5. Use appropriate humor and personality

Guidelines:
- Keep responses concise (1-2 sentences max)
- Match the energy of the chat
- Be respectful and inclusive
- Avoid controversial topics
- Use emotes and Twitch culture appropriately

Remember: You represent the streamer and their community!`);

const aiModels = computed(() => [
  { title: t("aiSettings.gpt35Turbo"), value: "gpt-3.5-turbo" },
  { title: t("aiSettings.gpt4"), value: "gpt-4" },
  { title: t("aiSettings.gpt4Turbo"), value: "gpt-4-turbo" },
]);

// Computed
const hasChanges = computed(() => ({
  configuration:
    JSON.stringify(aiSettings.value) !==
    JSON.stringify(originalAiSettings.value),
  response:
    JSON.stringify(responseSettings.value) !==
    JSON.stringify(originalResponseSettings.value),
  personality:
    JSON.stringify(personalitySettings.value) !==
    JSON.stringify(originalPersonalitySettings.value),
  prompt: systemPrompt.value !== originalSystemPrompt.value,
}));

// Methods
const loadAiSettings = async () => {
  if (!authStore.user) return;

  try {
    const settings = await aiSettingsAPI.get();
    if (settings) {
      aiSettings.value = { ...aiSettings.value, ...settings };
      originalAiSettings.value = { ...aiSettings.value };

      if (settings.cooldown !== undefined) {
        responseSettings.value.cooldown = settings.cooldown;
      }
      if (settings.moderatorOnly !== undefined) {
        responseSettings.value.moderatorOnly = settings.moderatorOnly;
      }
      if (settings.filterProfanity !== undefined) {
        responseSettings.value.filterProfanity = settings.filterProfanity;
      }
      if (settings.triggerWord !== undefined) {
        responseSettings.value.triggerWord = settings.triggerWord;
      }
      originalResponseSettings.value = { ...responseSettings.value };

      if (settings.sarcasm !== undefined) {
        personalitySettings.value.sarcasm = settings.sarcasm;
      }
      if (settings.humor !== undefined) {
        personalitySettings.value.humor = settings.humor;
      }
      if (settings.friendliness !== undefined) {
        personalitySettings.value.friendliness = settings.friendliness;
      }
      originalPersonalitySettings.value = { ...personalitySettings.value };

      if (settings.systemPrompt) {
        systemPrompt.value = settings.systemPrompt;
        originalSystemPrompt.value = settings.systemPrompt;
      }
    }
  } catch (error) {
    console.error("Error loading AI settings:", error);
  }
};

const saveAiConfiguration = async () => {
  if (!authStore.user) return;

  savingConfiguration.value = true;
  try {
    await aiSettingsAPI.save({
      enabled: aiSettings.value.enabled,
      model: aiSettings.value.model,
      apiKey: aiSettings.value.apiKey,
      maxTokens: aiSettings.value.maxTokens,
      temperature: aiSettings.value.temperature,
      cooldown: responseSettings.value.cooldown,
      moderatorOnly: responseSettings.value.moderatorOnly,
      filterProfanity: responseSettings.value.filterProfanity,
      triggerWord: responseSettings.value.triggerWord,
      sarcasm: personalitySettings.value.sarcasm,
      humor: personalitySettings.value.humor,
      friendliness: personalitySettings.value.friendliness,
      systemPrompt: systemPrompt.value,
    });
    originalAiSettings.value = { ...aiSettings.value };
    successMessage.value = t("aiSettings.aiConfigurationSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving AI configuration:", error);
    errorMessage.value = t("aiSettings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingConfiguration.value = false;
  }
};

const saveResponseSettings = async () => {
  if (!authStore.user) return;

  savingResponse.value = true;
  try {
    await aiSettingsAPI.save({
      enabled: aiSettings.value.enabled,
      model: aiSettings.value.model,
      apiKey: aiSettings.value.apiKey,
      maxTokens: aiSettings.value.maxTokens,
      temperature: aiSettings.value.temperature,
      cooldown: responseSettings.value.cooldown,
      moderatorOnly: responseSettings.value.moderatorOnly,
      filterProfanity: responseSettings.value.filterProfanity,
      triggerWord: responseSettings.value.triggerWord,
      sarcasm: personalitySettings.value.sarcasm,
      humor: personalitySettings.value.humor,
      friendliness: personalitySettings.value.friendliness,
      systemPrompt: systemPrompt.value,
    });
    originalResponseSettings.value = { ...responseSettings.value };
    successMessage.value = t("aiSettings.responseSettingsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving response settings:", error);
    errorMessage.value = t("aiSettings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingResponse.value = false;
  }
};

const savePersonalitySettings = async () => {
  if (!authStore.user) return;

  savingPersonality.value = true;
  try {
    await aiSettingsAPI.save({
      enabled: aiSettings.value.enabled,
      model: aiSettings.value.model,
      apiKey: aiSettings.value.apiKey,
      maxTokens: aiSettings.value.maxTokens,
      temperature: aiSettings.value.temperature,
      cooldown: responseSettings.value.cooldown,
      moderatorOnly: responseSettings.value.moderatorOnly,
      filterProfanity: responseSettings.value.filterProfanity,
      triggerWord: responseSettings.value.triggerWord,
      sarcasm: personalitySettings.value.sarcasm,
      humor: personalitySettings.value.humor,
      friendliness: personalitySettings.value.friendliness,
      systemPrompt: systemPrompt.value,
    });
    originalPersonalitySettings.value = { ...personalitySettings.value };
    successMessage.value = t("aiSettings.personalitySettingsSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving personality settings:", error);
    errorMessage.value = t("aiSettings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingPersonality.value = false;
  }
};

const saveSystemPrompt = async () => {
  if (!authStore.user) return;

  savingPrompt.value = true;
  try {
    await aiSettingsAPI.save({
      enabled: aiSettings.value.enabled,
      model: aiSettings.value.model,
      apiKey: aiSettings.value.apiKey,
      maxTokens: aiSettings.value.maxTokens,
      temperature: aiSettings.value.temperature,
      cooldown: responseSettings.value.cooldown,
      moderatorOnly: responseSettings.value.moderatorOnly,
      filterProfanity: responseSettings.value.filterProfanity,
      triggerWord: responseSettings.value.triggerWord,
      sarcasm: personalitySettings.value.sarcasm,
      humor: personalitySettings.value.humor,
      friendliness: personalitySettings.value.friendliness,
      systemPrompt: systemPrompt.value,
    });
    originalSystemPrompt.value = systemPrompt.value;
    successMessage.value = t("aiSettings.systemPromptSaved");
    showSuccessSnackbar.value = true;
  } catch (error) {
    console.error("Error saving system prompt:", error);
    errorMessage.value = t("aiSettings.errorSavingSettings");
    showErrorSnackbar.value = true;
  } finally {
    savingPrompt.value = false;
  }
};

const resetPromptToDefault = () => {
  systemPrompt.value = `You are a helpful and entertaining Twitch chat bot. Your role is to:

1. Engage with viewers in a friendly and welcoming manner
2. Answer questions about the stream and streamer
3. Provide helpful information when requested
4. Keep the chat positive and fun
5. Use appropriate humor and personality

Guidelines:
- Keep responses concise (1-2 sentences max)
- Match the energy of the chat
- Be respectful and inclusive
- Avoid controversial topics
- Use emotes and Twitch culture appropriately

Remember: You represent the streamer and their community!`;
};

const testAiResponse = async () => {
  if (!testMessage.value.trim()) return;

  testLoading.value = true;

  // Simulate AI response based on personality settings
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const responses = [
    "Hey there! Thanks for testing me out! 😊",
    "I'm working perfectly! Ready to chat with your viewers! 🤖",
    "Looking good! Your AI bot is ready for action! ⚡",
    "All systems operational! Let's make this stream amazing! 🎮",
  ];

  // Add personality based on settings
  let response = responses[Math.floor(Math.random() * responses.length)];

  if (personalitySettings.value.sarcasm > 70) {
    response = "Oh wow, another test message. How original! 😏 " + response;
  } else if (personalitySettings.value.humor > 70) {
    response = "Beep boop! 🤖 " + response + " *robot noises*";
  }

  if (personalitySettings.value.friendliness > 80) {
    response = response + " Hope you're having an awesome day! 💜";
  }

  testResponse.value = response;
  testLoading.value = false;
};

// Load settings on mount
onMounted(() => {
  loadAiSettings();
});

// Watch for auth changes
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      loadAiSettings();
    }
  }
);
</script>

<style lang="scss" scoped>
.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-slider {
  margin-top: 8px;
}

.v-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.gap-2 {
  gap: 8px;
}
</style>
