<template>
  <div class="dashboard">
    <!-- Overview Section -->
    <div v-if="selectedMenu === 'overview'">
      <div v-if="!userBotSettings">
        <v-skeleton-loader type="card" />
        <v-skeleton-loader type="card" />
        <v-skeleton-loader type="card" />
        <v-skeleton-loader type="card" />
      </div>
      <div v-else>
        <v-row class="mb-6">
          <v-col cols="12">
            <h1 class="text-h3 font-weight-bold mb-2">
              {{ $t("dashboard.overview") }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{ $t("dashboard.welcomeMessage") }}
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" color="primary" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="40" class="me-4">mdi-account-group</v-icon>
                  <div>
                    <h3 class="text-h4 font-weight-bold">
                      {{ userBotSettings.overview.chattersUsedBot }}
                    </h3>
                    <p class="text-subtitle-2">
                      {{ $t("dashboard.activeUsers") }}
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" color="success" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="40" class="me-4">mdi-robot</v-icon>
                  <div>
                    <h3 class="text-h4 font-weight-bold">42</h3>
                    <p class="text-subtitle-2">
                      {{ $t("dashboard.botCommands") }}
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card class="stat-card" color="warning" variant="tonal">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon size="40" class="me-4">mdi-chat</v-icon>
                  <div>
                    <h3 class="text-h4 font-weight-bold">892</h3>
                    <p class="text-subtitle-2">
                      {{ $t("dashboard.messagesToday") }}
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-6">
          <v-col cols="12" lg="8">
            <v-card>
              <v-card-title>
                <v-icon class="me-2">mdi-chart-line</v-icon>
                {{ $t("dashboard.recentActivity") }}
              </v-card-title>
              <v-card-text>
                <v-list
                  v-if="userBotSettings.overview.recentActivity.length > 0"
                >
                  <v-list-item
                    v-for="activity in userBotSettings.overview.recentActivity"
                    :key="activity.id"
                    :title="getActivityTitle(activity)"
                  >
                    <template v-slot:append>
                      <span class="text-caption text-medium-emphasis">
                        {{ getMinutesAgo(activity.timestamp) + "m ago" }}
                      </span>
                    </template>
                  </v-list-item>
                </v-list>
                <div class="text-center" v-else>
                  <p class="text-medium-emphasis">
                    {{ $t("dashboard.noRecentActivity") }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4"> </v-col>
        </v-row>
      </div>
    </div>

    <!-- Bot Commands Section -->
    <div v-else-if="selectedMenu === 'commands'">
      <BotCommands />
    </div>

    <!-- Moderation Section -->
    <div v-else-if="selectedMenu === 'moderation'">
      <ChatModeration />
    </div>

    <!-- Analytics Section -->
    <div v-else-if="selectedMenu === 'analytics'">
      <Analytics />
    </div>

    <!-- Stream Tools Section -->
    <div v-else-if="selectedMenu === 'tools'">
      <StreamTools />
    </div>

    <!-- AI Settings Section -->
    <div v-else-if="selectedMenu === 'ai-settings'">
      <AiSettings />
    </div>

    <!-- Settings Section -->
    <div v-else-if="selectedMenu === 'settings'">
      <Settings />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BotCommands from "./BotCommands.vue";
import ChatModeration from "./ChatModeration.vue";
import Analytics from "./Analytics.vue";
import StreamTools from "./StreamTools.vue";
import AiSettings from "./AiSettings.vue";
import Settings from "./Settings.vue";
import type { activity } from "@/stores/userStore";
import { useUserStore } from "@/stores/userStore";
import { storeToRefs } from "pinia";

const { userBotSettings } = storeToRefs(useUserStore());
// Props
interface Props {
  selectedMenu: string;
}

defineProps<Props>();

const getActivityTitle = (activity: activity) => {
  switch (activity.type) {
    case "message":
      return "User sent a message to bot";
    case "command":
      return "User used a command";
    case "action":
      return "User performed an action";
  }
};

const getMinutesAgo = (timestamp: string) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();
  return Math.floor(diff / (1000 * 60));
};
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 24px;
}

.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
}

.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
