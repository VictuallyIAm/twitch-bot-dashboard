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
              v-model="autoModerationEnabled"
              :label="$t('moderation.enableAutoModeration')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="blockLinks"
              :label="$t('moderation.blockLinks')"
              color="warning"
              :disabled="!autoModerationEnabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="capsFilter"
              :label="$t('moderation.capsFilter')"
              color="warning"
              :disabled="!autoModerationEnabled"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="symbolSpamFilter"
              :label="$t('moderation.symbolSpamFilter')"
              color="warning"
              :disabled="!autoModerationEnabled"
            ></v-switch>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-speedometer</v-icon>
            {{ $t("moderation.chatLimits") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model.number="slowModeSeconds"
              :label="$t('moderation.slowModeSeconds')"
              type="number"
              variant="outlined"
              min="0"
              max="300"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="maxMessageLength"
              :label="$t('moderation.maxMessageLength')"
              type="number"
              variant="outlined"
              min="10"
              max="500"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="followersOnlyMinutes"
              :label="$t('moderation.followersOnlyMinutes')"
              type="number"
              variant="outlined"
              min="0"
              max="10080"
            ></v-text-field>
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

            <div v-else>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Data
const autoModerationEnabled = ref(true);
const blockLinks = ref(true);
const capsFilter = ref(true);
const symbolSpamFilter = ref(false);

const slowModeSeconds = ref(0);
const maxMessageLength = ref(500);
const followersOnlyMinutes = ref(0);

const newBannedWord = ref("");
const showAddWordDialog = ref(false);

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

// Methods
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
