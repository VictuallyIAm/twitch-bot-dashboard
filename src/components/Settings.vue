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
          {{ $t("settings.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("settings.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-robot</v-icon>
            {{ $t("settings.botConfiguration") }}
          </v-card-title>
          <v-card-text class="mt-4">
            <v-text-field
              v-model="userBotSettings.generalSettings.commandPrefix"
              :label="$t('settings.commandPrefix')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-switch
              v-model="userBotSettings.generalSettings.autoConnectOnStartup"
              :label="$t('settings.autoConnectOnStartup')"
              color="primary"
            ></v-switch>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-bell</v-icon>
            {{ $t("settings.notifications") }}
          </v-card-title>
          <v-card-text class="mt-4">
            <v-switch
              v-model="userBotSettings.generalSettings.reactOnFollow"
              :label="$t('settings.newFollowers')"
              color="success"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="userBotSettings.generalSettings.reactOnDonate"
              :label="$t('settings.donations')"
              color="warning"
              class="mb-4"
            ></v-switch>

            <v-switch
              v-model="userBotSettings.generalSettings.reactOnSubscribe"
              :label="$t('settings.subscriptions')"
              color="primary"
              class="mb-4"
            ></v-switch>
            <v-switch
              v-model="userBotSettings.generalSettings.reactOnRaids"
              :label="$t('settings.raids')"
              color="primary"
              class="mb-4"
            ></v-switch>
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
</script>

<style lang="scss" scoped>
.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.gap-3 {
  gap: 12px;
}

.v-switch {
  .v-selection-control__wrapper {
    margin-right: 8px;
  }
}
</style>
