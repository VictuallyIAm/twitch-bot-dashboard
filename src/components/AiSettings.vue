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
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-account-voice</v-icon>
            {{ $t("aiSettings.responseSettings") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model.number="aiSettings.cooldown"
              :label="$t('aiSettings.aiResponseCooldown')"
              type="number"
              variant="outlined"
              min="5"
              max="300"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-text-field>

            <v-switch
              v-model="aiSettings.moderatorOnly"
              :label="$t('aiSettings.moderatorOnlyTriggers')"
              color="warning"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="aiSettings.filterProfanity"
              :label="$t('aiSettings.filterProfanity')"
              color="error"
              :disabled="!aiSettings.enabled"
              class="mb-4"
            ></v-switch>

            <v-text-field
              v-model="aiSettings.triggerWord"
              :label="$t('aiSettings.aiTriggerWord')"
              variant="outlined"
              :disabled="!aiSettings.enabled"
              :hint="$t('aiSettings.triggerWordHint')"
              persistent-hint
            ></v-text-field>
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
                  $t("aiSettings.sarcasmLevel", { level: aiSettings.sarcasm })
                }}
                😏
              </v-label>
              <v-slider
                v-model="aiSettings.sarcasm"
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
                  $t("aiSettings.humorLevel", { level: aiSettings.humor })
                }}
                😄
              </v-label>
              <v-slider
                v-model="aiSettings.humor"
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
                    level: aiSettings.friendliness,
                  })
                }}
                😊
              </v-label>
              <v-slider
                v-model="aiSettings.friendliness"
                min="0"
                max="100"
                step="5"
                :disabled="!aiSettings.enabled"
                thumb-label
                color="green"
              ></v-slider>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-script-text</v-icon>
            {{ $t("aiSettings.customSystemPrompt") }}
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="aiSettings.systemPrompt"
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
                @click="saveSettings"
                :disabled="!aiSettings.enabled"
              >
                {{ $t("aiSettings.saveAiSettings") }}
              </v-btn>

              <v-btn
                variant="outlined"
                prepend-icon="mdi-restore"
                @click="resetToDefaults"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Data
const testMessage = ref("");
const testResponse = ref("");
const testLoading = ref(false);

const aiSettings = ref({
  enabled: false,
  model: "gpt-3.5-turbo",
  apiKey: "",
  maxTokens: 150,
  temperature: 0.7,
  cooldown: 30,
  moderatorOnly: false,
  filterProfanity: true,
  triggerWord: "bot",
  sarcasm: 25,
  humor: 50,
  friendliness: 75,
  systemPrompt: `You are a helpful and entertaining Twitch chat bot. Your role is to:

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

Remember: You represent the streamer and their community!`,
});

const aiModels = computed(() => [
  { title: t("aiSettings.gpt35Turbo"), value: "gpt-3.5-turbo" },
  { title: t("aiSettings.gpt4"), value: "gpt-4" },
  { title: t("aiSettings.gpt4Turbo"), value: "gpt-4-turbo" },
]);

// Methods
const saveSettings = () => {
  console.log("AI settings saved:", aiSettings.value);
  // Here you would typically save to localStorage or send to backend
};

const resetToDefaults = () => {
  aiSettings.value = {
    enabled: false,
    model: "gpt-3.5-turbo",
    apiKey: "",
    maxTokens: 150,
    temperature: 0.7,
    cooldown: 30,
    moderatorOnly: false,
    filterProfanity: true,
    triggerWord: "bot",
    sarcasm: 25,
    humor: 50,
    friendliness: 75,
    systemPrompt: `You are a helpful and entertaining Twitch chat bot. Your role is to:

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

Remember: You represent the streamer and their community!`,
  };
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

  if (aiSettings.value.sarcasm > 70) {
    response = "Oh wow, another test message. How original! 😏 " + response;
  } else if (aiSettings.value.humor > 70) {
    response = "Beep boop! 🤖 " + response + " *robot noises*";
  }

  if (aiSettings.value.friendliness > 80) {
    response = response + " Hope you're having an awesome day! 💜";
  }

  testResponse.value = response;
  testLoading.value = false;
};
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
