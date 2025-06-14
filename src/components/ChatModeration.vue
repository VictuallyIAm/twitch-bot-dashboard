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
          <v-card-text class="mt-4">
            <v-switch
              v-model="userBotSettings.moderation.enabled"
              :label="$t('moderation.enableAutoModeration')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="userBotSettings.moderation.blockLinks"
              :label="$t('moderation.blockLinks')"
              color="warning"
              :disabled="!userBotSettings.moderation.enabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="userBotSettings.moderation.blockCaps"
              :label="$t('moderation.capsFilter')"
              color="warning"
              :disabled="!userBotSettings.moderation.enabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="userBotSettings.moderation.blockSpam"
              :label="$t('moderation.symbolSpamFilter')"
              color="warning"
              :disabled="!userBotSettings.moderation.enabled"
            ></v-switch>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-cancel</v-icon>
            {{ $t("moderation.bannedWords") }}
          </v-card-title>
          <v-card-text class="mt-4">
            <div class="d-flex mb-4">
              <v-text-field
                v-model="newBannedWord"
                :label="$t('moderation.wordToBan')"
                variant="outlined"
                hide-details
                class="me-2"
                @keyup.enter="addBannedWord"
                density="compact"
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
              v-if="userBotSettings.moderation.bannedWords.length === 0"
              class="text-center text-medium-emphasis py-4"
            >
              <p>{{ $t("moderation.noBannedWords") }}</p>
            </div>

            <div v-else>
              <v-chip
                v-for="word in userBotSettings.moderation.bannedWords"
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="d-flex justify-end">
      <v-col cols="12" sm="6" md="3" class="d-flex justify-end">
        <v-btn color="primary" @click="saveSettings">
          {{ $t("moderation.saveSettings") }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
const { userBotSettings } = storeToRefs(useUserStore());

const newBannedWord = ref("");

// Methods
const addBannedWord = () => {
  const word = newBannedWord.value.trim().toLowerCase();
  if (word && !userBotSettings.value?.moderation.bannedWords.includes(word)) {
    userBotSettings.value?.moderation.bannedWords.push(word);
    newBannedWord.value = "";
  }
};

const removeBannedWord = (word: string) => {
  if (userBotSettings.value) {
    userBotSettings.value.moderation.bannedWords =
      userBotSettings.value.moderation.bannedWords.filter((w) => w !== word);
  }
};

const saveSettings = () => {
  console.log("saveSettings");
};
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
