<template>
  <div>
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

    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" variant="tonal">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="40" class="me-4">mdi-eye</v-icon>
              <div>
                <h3 class="text-h4 font-weight-bold">
                  {{ totalViews.toLocaleString() }}
                </h3>
                <p class="text-subtitle-2">{{ $t("analytics.totalViews") }}</p>
                <p class="text-caption text-success">
                  {{ $t("analytics.weekGrowth") }}
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
              <v-icon size="40" class="me-4">mdi-account-heart</v-icon>
              <div>
                <h3 class="text-h4 font-weight-bold">
                  {{ followers.toLocaleString() }}
                </h3>
                <p class="text-subtitle-2">{{ $t("analytics.followers") }}</p>
                <p class="text-caption text-success">
                  {{ $t("analytics.todayGrowth") }}
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
              <v-icon size="40" class="me-4">mdi-message</v-icon>
              <div>
                <h3 class="text-h4 font-weight-bold">
                  {{ chatMessages.toLocaleString() }}
                </h3>
                <p class="text-subtitle-2">
                  {{ $t("analytics.chatMessages") }}
                </p>
                <p class="text-caption text-info">
                  {{ $t("analytics.lastSevenDays") }}
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
              <v-icon size="40" class="me-4">mdi-robot</v-icon>
              <div>
                <h3 class="text-h4 font-weight-bold">
                  {{ botCommands.toLocaleString() }}
                </h3>
                <p class="text-subtitle-2">
                  {{ $t("analytics.botCommandsUsed") }}
                </p>
                <p class="text-caption text-info">
                  {{ $t("analytics.usedThisWeek") }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
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
            <v-list>
              <v-list-item
                v-for="command in topCommands"
                :key="command.name"
                :prepend-icon="command.icon"
                :title="command.name"
                :subtitle="$t('analytics.usedTimes', { count: command.count })"
              >
                <template v-slot:append>
                  <v-progress-linear
                    :model-value="(command.count / topCommands[0].count) * 100"
                    color="primary"
                    height="8"
                    width="100"
                    class="me-4"
                  ></v-progress-linear>
                  <span class="text-h6 font-weight-bold">{{
                    command.count
                  }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-clock</v-icon>
            {{ $t("analytics.streamSchedule") }}
          </v-card-title>
          <v-card-text>
            <div class="schedule-item" v-for="day in schedule" :key="day.day">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="font-weight-medium">{{ day.day }}</span>
                <span class="text-body-2">{{ day.time }}</span>
              </div>
              <v-divider
                v-if="day !== schedule[schedule.length - 1]"
              ></v-divider>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-account-group</v-icon>
            {{ $t("analytics.topChatters") }}
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="chatter in topChatters"
                :key="chatter.username"
                :title="chatter.username"
                :subtitle="
                  $t('analytics.messages', { count: chatter.messages })
                "
              >
                <template v-slot:prepend>
                  <v-avatar size="32" :color="chatter.color">
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Data
const totalViews = ref(45678);
const followers = ref(2341);
const chatMessages = ref(12456);
const botCommands = ref(892);

const topCommands = ref([
  { name: "!hello", count: 156, icon: "mdi-hand-wave" },
  { name: "!discord", count: 89, icon: "mdi-discord" },
  { name: "!uptime", count: 67, icon: "mdi-clock" },
  { name: "!weather", count: 34, icon: "mdi-weather-cloudy" },
  { name: "!song", count: 28, icon: "mdi-music" },
]);

const schedule = ref([
  { day: "Monday", time: "7:00 PM - 11:00 PM" },
  { day: "Tuesday", time: "Off" },
  { day: "Wednesday", time: "7:00 PM - 10:00 PM" },
  { day: "Thursday", time: "8:00 PM - 11:00 PM" },
  { day: "Friday", time: "6:00 PM - 12:00 AM" },
  { day: "Saturday", time: "2:00 PM - 8:00 PM" },
  { day: "Sunday", time: "3:00 PM - 7:00 PM" },
]);

const topChatters = ref([
  { username: "ChatKing", messages: 445, color: "primary" },
  { username: "StreamFan", messages: 389, color: "success" },
  { username: "MessageMaster", messages: 267, color: "warning" },
  { username: "TalkativeUser", messages: 234, color: "info" },
  { username: "ChatterBox", messages: 198, color: "secondary" },
]);
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
