<template>
  <v-card class="auth-card" elevation="12">
    <div class="auth-backdrop"></div>
    <v-card-text class="pa-8">
      <div class="text-center mb-8">
        <v-icon size="80" color="primary" class="mb-4">mdi-robot</v-icon>
        <h1 class="text-h3 font-weight-bold mb-3">
          {{ $t("auth.welcomeToBot") }}
        </h1>
        <p class="text-h6 text-medium-emphasis mb-6">
          {{ $t("auth.twitchOnlyDescription") }}
        </p>
      </div>

      <div class="text-center">
        <!-- Error Display -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-6"
          closable
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- Success Message for Authenticated Users -->
        <v-alert
          v-if="isTwitchAuthenticated"
          type="success"
          variant="tonal"
          class="mb-6"
          icon="mdi-check-circle"
        >
          {{ $t("auth.loginSuccess") }}
        </v-alert>

        <v-btn
          color="#9146FF"
          size="x-large"
          block
          class="mb-6 twitch-btn"
          :loading="loading"
          :disabled="isTwitchAuthenticated"
          @click="loginWithTwitch"
          prepend-icon="mdi-twitch"
          elevation="4"
          height="60"
        >
          <span class="text-h6 font-weight-bold">
            {{
              isTwitchAuthenticated
                ? $t("auth.alreadyLoggedIn")
                : $t("auth.loginWithTwitch")
            }}
          </span>
        </v-btn>

        <div class="security-info">
          <v-icon size="20" color="success" class="me-2"
            >mdi-shield-check</v-icon
          >
          <span class="text-body-2 text-medium-emphasis">
            {{ $t("auth.twitchSecureNote") }}
          </span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTwitchAuth } from "@/composables/useTwitchAuth";

const route = useRoute();

// Use the Twitch OAuth composable
const {
  loginWithTwitch,
  handleCallbackFromUrl,
  handleOAuthError,
  isLoading,
  error,
  isTwitchAuthenticated,
} = useTwitchAuth();

// Handle OAuth callback or errors on component mount
onMounted(() => {
  // Check for OAuth callback parameters
  if (route.query.code) {
    handleCallbackFromUrl();
  }

  // Check for OAuth errors
  if (route.query.error) {
    handleOAuthError(route.query.error as string);
  }
});

// Use loading state from composable
const loading = computed(() => isLoading.value);
</script>

<style lang="scss" scoped>
.auth-card {
  position: relative;
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.95);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  .v-card-text {
    background: transparent;
  }
}

.auth-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(145, 70, 255, 0.08) 0%,
    rgba(145, 70, 255, 0.04) 50%,
    transparent 100%
  );
  pointer-events: none;
}

.v-card-text {
  position: relative;
  z-index: 1;
}

.twitch-btn {
  text-transform: none;
  font-weight: 700;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(145, 70, 255, 0.4) !important;
  }

  &:active {
    transform: translateY(0);
  }

  :deep(.v-btn__content) {
    gap: 12px;
  }

  :deep(.v-icon) {
    font-size: 28px;
  }
}

.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(var(--v-theme-success), 0.1);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

// Dark theme specific adjustments
.v-theme--dark {
  .auth-card {
    background: rgba(var(--v-theme-surface), 0.92);
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .auth-backdrop {
    background: linear-gradient(
      135deg,
      rgba(145, 70, 255, 0.12) 0%,
      rgba(145, 70, 255, 0.06) 50%,
      transparent 100%
    );
  }
}

// Light theme specific adjustments
.v-theme--light {
  .auth-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .auth-backdrop {
    background: linear-gradient(
      135deg,
      rgba(145, 70, 255, 0.06) 0%,
      rgba(145, 70, 255, 0.03) 50%,
      transparent 100%
    );
  }
}
</style>
