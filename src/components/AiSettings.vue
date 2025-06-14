<template>
  <div v-if="!userBotSettings">
    <v-skeleton-loader type="card" />
    <v-skeleton-loader type="card" />
    <v-skeleton-loader type="card" />
  </div>
  <div v-else>
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
              v-model="userBotSettings.aiSettings.idAIEnabled"
              :label="$t('aiSettings.enableAi')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-select
              v-model="userBotSettings.aiSettings.model"
              :label="$t('aiSettings.aiModel')"
              :items="aiModels"
              variant="outlined"
              :disabled="!userBotSettings.aiSettings.idAIEnabled"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model.number="userBotSettings.aiSettings.maxTokens"
              :label="$t('aiSettings.maxResponseTokens')"
              type="number"
              variant="outlined"
              min="50"
              max="500"
              :disabled="!userBotSettings.aiSettings.idAIEnabled"
              class="mb-4"
            ></v-text-field>

            <div class="mb-4">
              <v-label class="mb-2">{{
                $t("aiSettings.creativityLevel")
              }}</v-label>
              <v-slider
                v-model="userBotSettings.aiSettings.creativity"
                min="0"
                max="1"
                step="0.1"
                :disabled="!userBotSettings.aiSettings.idAIEnabled"
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
              v-model.number="userBotSettings.aiSettings.requestsPerMinute"
              :label="$t('aiSettings.aiResponseLimit')"
              type="number"
              variant="outlined"
              min="5"
              max="300"
              :disabled="!userBotSettings.aiSettings.idAIEnabled"
              class="mb-4"
            ></v-text-field>

            <v-switch
              v-model="userBotSettings.aiSettings.moderatorOnly"
              :label="$t('aiSettings.moderatorOnlyTriggers')"
              color="warning"
              :disabled="!userBotSettings.aiSettings.idAIEnabled"
              class="mb-4"
            ></v-switch>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-comedy</v-icon>
            {{ $t("aiSettings.personalitySettings") }}
          </v-card-title>
          <v-card-text class="mt-4">
            <div class="mb-4">
              <v-label class="mb-2">
                {{ $t("aiSettings.sarcasmLevel") }}
                😏
              </v-label>
              <v-slider
                v-model="userBotSettings.aiSettings.sarcasm"
                min="0"
                max="100"
                step="5"
                :disabled="!userBotSettings.aiSettings.idAIEnabled"
                thumb-label
                color="purple"
              ></v-slider>
            </div>

            <div class="mb-4">
              <v-label class="mb-2">
                {{ $t("aiSettings.humorLevel") }}
                😄
              </v-label>
              <v-slider
                v-model="userBotSettings.aiSettings.humor"
                min="0"
                max="100"
                step="5"
                :disabled="!userBotSettings.aiSettings.idAIEnabled"
                thumb-label
                color="orange"
              ></v-slider>
            </div>

            <div class="mb-4">
              <v-label class="mb-2">
                {{ $t("aiSettings.friendliness") }}
                😊
              </v-label>
              <v-slider
                v-model="userBotSettings.aiSettings.friendliness"
                min="0"
                max="100"
                step="5"
                :disabled="!userBotSettings.aiSettings.idAIEnabled"
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
              v-model="userBotSettings.aiSettings.systemPrompt"
              :label="$t('aiSettings.systemPrompt')"
              variant="outlined"
              rows="8"
              :disabled="!userBotSettings.aiSettings.idAIEnabled"
              :hint="$t('aiSettings.systemPromptHint')"
              persistent-hint
              class="mb-4"
            ></v-textarea>

            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                @click="saveSettings"
                :disabled="!userBotSettings.aiSettings.idAIEnabled"
              >
                {{ $t("aiSettings.saveAiSettings") }}
              </v-btn>

              <v-btn
                variant="outlined"
                prepend-icon="mdi-restore"
                @click="resetToDefaults"
                :disabled="!userBotSettings.aiSettings.idAIEnabled"
              >
                {{ $t("aiSettings.resetToDefaults") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="userBotSettings.aiSettings.idAIEnabled">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-test-tube</v-icon>
            {{ $t("aiSettings.testAiResponse") }}
          </v-card-title>
          <v-card-text class="mt-4">
            <v-text-field
              v-model="testMessage"
              :label="$t('aiSettings.testMessage')"
              variant="outlined"
              :disabled="!userBotSettings.aiSettings.idAIEnabled"
              class="mb-4"
              @keyup.enter="testAiResponse"
            ></v-text-field>

            <v-btn
              color="success"
              prepend-icon="mdi-play"
              @click="testAiResponse"
              :disabled="
                !userBotSettings.aiSettings.idAIEnabled || !testMessage.trim()
              "
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
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const userStore = useUserStore();
const { userBotSettings } = storeToRefs(userStore);

// Data
const testMessage = ref("");
const testResponse = ref("");
const testLoading = ref(false);

const aiModels = computed(() => [
  { title: t("aiSettings.gpt35Turbo"), value: "gpt-3.5-turbo" },
  { title: t("aiSettings.gpt4"), value: "gpt-4" },
  { title: t("aiSettings.gpt4Turbo"), value: "gpt-4-turbo" },
]);

const saveSettings = () => {
  console.log("saveSettings");
};

const resetToDefaults = () => {
  console.log("resetToDefaults");
};

const testAiResponse = () => {
  console.log("testAiResponse");
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
