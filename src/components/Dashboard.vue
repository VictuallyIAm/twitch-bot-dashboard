<template>
  <div class="dashboard">
    <!-- Overview Section -->
    <div v-if="selectedMenu === 'overview'">
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
                  <h3 class="text-h4 font-weight-bold">1,234</h3>
                  <p class="text-subtitle-2">
                    {{ $t("dashboard.activeViewers") }}
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

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="info" variant="tonal">
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="40" class="me-4">mdi-clock</v-icon>
                <div>
                  <h3 class="text-h4 font-weight-bold">4.2h</h3>
                  <p class="text-subtitle-2">
                    {{ $t("dashboard.streamTime") }}
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
              <v-list>
                <v-list-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :prepend-icon="activity.icon"
                  :title="activity.title"
                  :subtitle="activity.subtitle"
                >
                  <template v-slot:append>
                    <span class="text-caption text-medium-emphasis">
                      {{ activity.time }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card>
            <v-card-title>
              <v-icon class="me-2">mdi-cog</v-icon>
              {{ $t("dashboard.quickActions") }}
            </v-card-title>
            <v-card-text>
              <v-btn
                v-for="action in quickActions"
                :key="action.title"
                :prepend-icon="action.icon"
                :color="action.color"
                variant="tonal"
                block
                class="mb-2"
                @click="handleQuickAction(action.action)"
              >
                {{ $t(`dashboard.${action.action}`) }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
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

// Props
interface Props {
  selectedMenu: string;
}

defineProps<Props>();

// Mock data
const recentActivities = ref([
  {
    id: 1,
    icon: "mdi-account-plus",
    title: "New follower: TwitchUser123",
    subtitle: "Followed your channel",
    time: "2 min ago",
  },
  {
    id: 2,
    icon: "mdi-robot",
    title: "Bot command executed",
    subtitle: "!weather command used by StreamerFan",
    time: "5 min ago",
  },
  {
    id: 3,
    icon: "mdi-shield-alert",
    title: "Chat moderation action",
    subtitle: "Message deleted for spam",
    time: "8 min ago",
  },
  {
    id: 4,
    icon: "mdi-gift",
    title: "New donation received",
    subtitle: "$5.00 from GenerousViewer",
    time: "12 min ago",
  },
  {
    id: 5,
    icon: "mdi-star",
    title: "Channel subscription",
    subtitle: "StreamSupporter subscribed",
    time: "15 min ago",
  },
]);

const quickActions = ref([
  {
    title: "Start Bot",
    icon: "mdi-play",
    color: "success",
    action: "startBot",
  },
  {
    title: "Clear Chat",
    icon: "mdi-delete-sweep",
    color: "warning",
    action: "clearChat",
  },
  {
    title: "Enable Slow Mode",
    icon: "mdi-speedometer-slow",
    color: "info",
    action: "enableSlowMode",
  },
  {
    title: "Run Giveaway",
    icon: "mdi-gift",
    color: "primary",
    action: "runGiveaway",
  },
]);

// Methods
const handleQuickAction = (action: string) => {
  console.log("Quick action triggered:", action);
  // Handle quick actions here
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
