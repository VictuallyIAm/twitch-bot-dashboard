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

interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

interface TwitchUserResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
    email: string;
    profile_image_url: string;
  }>;
}

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const loading = ref(true);
const success = ref(false);
const error = ref(false);
const errorMessage = ref("");

const exchangeCodeForToken = async (
  code: string,
  state: string
): Promise<TwitchTokenResponse> => {
  // Verify state parameter
  const storedState = localStorage.getItem("twitch_auth_state");
  if (state !== storedState) {
    throw new Error("Invalid state parameter");
  }

  const clientId = "your_twitch_client_id"; // Replace with your actual client ID
  const clientSecret = "your_twitch_client_secret"; // Replace with your actual client secret
  const redirectUri = `${window.location.origin}/auth/twitch/callback`;

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json();
};

const getUserInfo = async (
  accessToken: string
): Promise<TwitchUserResponse> => {
  const clientId = "your_twitch_client_id"; // Replace with your actual client ID

  const response = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": clientId,
    },
  });

  if (!response.ok) {
    throw new Error(`User info fetch failed: ${response.statusText}`);
  }

  return response.json();
};

const handleTwitchCallback = async () => {
  try {
    const code = route.query.code as string;
    const state = route.query.state as string;
    const errorParam = route.query.error as string;

    // Check for error in callback
    if (errorParam) {
      throw new Error(`Twitch OAuth error: ${errorParam}`);
    }

    if (!code || !state) {
      throw new Error("Missing authorization code or state parameter");
    }

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code, state);

    // Get user information
    const userResponse = await getUserInfo(tokenResponse.access_token);
    const userData = userResponse.data[0];

    // Store authentication data
    localStorage.setItem("twitch_access_token", tokenResponse.access_token);
    localStorage.setItem("twitch_refresh_token", tokenResponse.refresh_token);
    localStorage.setItem(
      "twitch_token_expires",
      (Date.now() + tokenResponse.expires_in * 1000).toString()
    );
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        id: userData.id,
        username: userData.display_name || userData.login,
        email: userData.email,
        avatar: userData.profile_image_url,
        loginMethod: "twitch",
      })
    );

    // Clean up state
    localStorage.removeItem("twitch_auth_state");

    loading.value = false;
    success.value = true;

    // Auto-redirect after 3 seconds
    setTimeout(() => {
      redirectToDashboard();
    }, 3000);
  } catch (err) {
    console.error("Twitch authentication error:", err);
    loading.value = false;
    error.value = true;
    errorMessage.value =
      err instanceof Error ? err.message : t("auth.unknownError");

    // Clean up any stored state
    localStorage.removeItem("twitch_auth_state");
  }
};

const redirectToDashboard = () => {
  router.push("/");
};

const redirectToLogin = () => {
  router.push("/");
};

onMounted(() => {
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
