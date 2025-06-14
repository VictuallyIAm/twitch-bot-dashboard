<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-8 text-center" elevation="8">
              <v-card-text>
                <div v-if="loading">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                    class="mb-4"
                  ></v-progress-circular>
                  <h2 class="text-h5 mb-2">{{ $t("auth.processing") }}</h2>
                  <p class="text-body-1">
                    {{ $t("auth.processingDescription") }}
                  </p>
                </div>

                <div v-else-if="success">
                  <v-icon color="success" size="64" class="mb-4"
                    >mdi-check-circle</v-icon
                  >
                  <h2 class="text-h5 mb-2 text-success">
                    {{ $t("auth.success") }}
                  </h2>
                  <p class="text-body-1 mb-4">
                    {{ $t("auth.successDescription") }}
                  </p>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="redirectToDashboard"
                    prepend-icon="mdi-view-dashboard"
                  >
                    {{ $t("auth.goToDashboard") }}
                  </v-btn>
                </div>

                <div v-else-if="error">
                  <v-icon color="error" size="64" class="mb-4"
                    >mdi-alert-circle</v-icon
                  >
                  <h2 class="text-h5 mb-2 text-error">
                    {{ $t("auth.error") }}
                  </h2>
                  <p class="text-body-1 mb-4">{{ errorMessage }}</p>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    @click="redirectToLogin"
                    prepend-icon="mdi-arrow-left"
                  >
                    {{ $t("auth.backToLogin") }}
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/userStore";

const { getUser, setAuthTokens } = useUserStore();

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const loading = ref(true);
const success = ref(false);
const error = ref(false);
const errorMessage = ref("");

const handleTwitchCallback = async () => {
  const params = new URLSearchParams(window.location.hash.substring(1));

  const returnedState = params.get("state");
  const expectedState = localStorage.getItem("twitch_oauth_state");

  if (returnedState !== expectedState) {
    error.value = true;
    errorMessage.value = "OAuth state mismatch. Aborting.";
    return;
  }

  setAuthTokens(params.get("access_token") || "");
  await getUser();

  redirectToDashboard();
};

const redirectToDashboard = () => {
  router.push("/");
};

const redirectToLogin = () => {
  router.push("/");
};

onMounted(async () => {
  handleTwitchCallback();
});
</script>

<style lang="scss" scoped>
.v-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
}

.v-progress-circular {
  margin: 0 auto;
}
</style>
