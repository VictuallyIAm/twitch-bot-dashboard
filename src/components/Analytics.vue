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
          {{ $t("analytics.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("analytics.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-trophy</v-icon>
            {{ $t("analytics.topCommands") }}
          </v-card-title>
          <v-card-text>
            <v-list v-if="userBotSettings.analytics.commandsUsed.length > 0">
              <v-list-item
                v-for="command in userBotSettings.analytics.commandsUsed"
                :key="command.command"
                :title="command.command"
                :subtitle="
                  $t('analytics.usedTimes', { count: command.usageCount })
                "
              >
                <template v-slot:append>
                  <v-progress-linear
                    :model-value="
                      (command.usageCount /
                        userBotSettings.analytics.commandsUsed[0].usageCount) *
                      100
                    "
                    color="primary"
                    height="8"
                    width="100"
                    class="me-4"
                  ></v-progress-linear>
                  <span class="text-h6 font-weight-bold">{{
                    command.usageCount
                  }}</span>
                </template>
              </v-list-item>
            </v-list>
            <div class="text-center" v-else>
              <p class="text-medium-emphasis">
                {{ $t("analytics.noCommands") }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-account-group</v-icon>
            {{ $t("analytics.topChatters") }}
          </v-card-title>
          <v-card-text>
            <v-list v-if="userBotSettings.analytics.topUsers.length > 0">
              <v-list-item
                v-for="chatter in userBotSettings.analytics.topUsers"
                :key="chatter.username"
                :title="chatter.username"
                :subtitle="
                  $t('analytics.messages', { count: chatter.messages })
                "
              >
                <template v-slot:prepend>
                  <v-avatar size="32">
                    {{ chatter.username[0].toUpperCase() }}
                  </v-avatar>
                </template>
                <template v-slot:append>
                  <v-chip size="small" variant="outlined">
                    {{ chatter.messages }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div class="text-center" v-else>
              <p class="text-medium-emphasis">
                {{ $t("analytics.noChatters") }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";
const { userBotSettings } = storeToRefs(useUserStore());
</script>

<style lang="scss" scoped>
.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
}

.schedule-item {
  padding: 8px 0;
}

.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
