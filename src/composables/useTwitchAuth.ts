import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useFirebaseAuth } from "vuefire";
import { signInWithCustomToken } from "firebase/auth";
import { apiService } from "@/services/api";

export const useTwitchAuth = () => {
  const router = useRouter();
  const auth = useFirebaseAuth();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const user = ref(null);

  /**
   * Generate a random state for OAuth security
   */
  const generateState = (): string => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  /**
   * Store state in session storage for validation
   */
  const storeState = (state: string): void => {
    sessionStorage.setItem("twitch_oauth_state", state);
  };

  /**
   * Retrieve and validate state from session storage
   */
  const validateState = (receivedState: string): boolean => {
    const storedState = sessionStorage.getItem("twitch_oauth_state");
    sessionStorage.removeItem("twitch_oauth_state");
    return storedState === receivedState;
  };

  /**
   * Initiate Twitch OAuth flow (redirect method)
   */
  const loginWithTwitch = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const state = generateState();
      storeState(state);

      const { authUrl } = await apiService.getTwitchAuthUrl(state);

      // Redirect to Twitch OAuth
      window.location.href = authUrl;
    } catch (err: any) {
      error.value = err.message || "Failed to initiate Twitch authentication";
      console.error("Error starting Twitch OAuth:", err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Handle OAuth callback with authorization code
   */
  const handleCallback = async (code: string, state?: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Validate state parameter if provided
      if (state && !validateState(state)) {
        throw new Error("Invalid state parameter - possible CSRF attack");
      }

      // Exchange code for Firebase token
      const result = await apiService.exchangeTwitchCode(code, state);

      if (!result.success) {
        throw new Error("Failed to authenticate with Twitch");
      }

      // Sign in to Firebase with custom token
      if (auth) {
        await signInWithCustomToken(auth, result.firebaseToken);
        user.value = result.user as any;

        // Redirect to dashboard or intended page
        const intendedRoute =
          sessionStorage.getItem("intended_route") || "/dashboard";
        sessionStorage.removeItem("intended_route");
        router.push(intendedRoute);
      } else {
        throw new Error("Firebase auth not available");
      }
    } catch (err: any) {
      error.value = err.message || "Failed to complete Twitch authentication";
      console.error("Error in Twitch OAuth callback:", err);

      // Redirect to login with error
      router.push(
        "/login?error=" + encodeURIComponent(error.value || "Unknown error")
      );
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Handle OAuth callback from URL parameters
   */
  const handleCallbackFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (error) {
      const errorDescription =
        urlParams.get("error_description") || "OAuth was cancelled or failed";
      router.push("/login?error=" + encodeURIComponent(errorDescription));
      return;
    }

    if (code) {
      await handleCallback(code, state || undefined);
    }
  };

  /**
   * Refresh Twitch access token
   */
  const refreshToken = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      await apiService.refreshTwitchToken();

      return true;
    } catch (err: any) {
      error.value = err.message || "Failed to refresh Twitch token";
      console.error("Error refreshing Twitch token:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Validate current Twitch token
   */
  const validateToken = async () => {
    try {
      const result = await apiService.validateTwitchToken();
      return result.valid;
    } catch (err: any) {
      console.error("Error validating Twitch token:", err);
      return false;
    }
  };

  /**
   * Store intended route for post-login redirect
   */
  const storeIntendedRoute = (route: string) => {
    sessionStorage.setItem("intended_route", route);
  };

  /**
   * Check if user is authenticated with Twitch
   */
  const isTwitchAuthenticated = computed(() => {
    return auth?.currentUser != null;
  });

  /**
   * Get Twitch auth URL without redirecting
   */
  const getTwitchAuthUrl = async (customState?: string) => {
    try {
      const state = customState || generateState();
      if (!customState) {
        storeState(state);
      }

      const { authUrl } = await apiService.getTwitchAuthUrl(state);
      return authUrl;
    } catch (err: any) {
      error.value = err.message || "Failed to generate Twitch auth URL";
      throw err;
    }
  };

  /**
   * Handle different OAuth error scenarios
   */
  const handleOAuthError = (errorType: string) => {
    const errorMessages = {
      oauth_denied:
        "You cancelled the Twitch authorization. Please try again to continue.",
      no_code: "No authorization code received from Twitch. Please try again.",
      auth_failed: "Authentication with Twitch failed. Please try again.",
      invalid_state:
        "Security validation failed. Please start the login process again.",
      token_expired: "Your session has expired. Please log in again.",
    };

    error.value =
      errorMessages[errorType as keyof typeof errorMessages] ||
      "An error occurred during authentication. Please try again.";
  };

  return {
    // State
    isLoading,
    error,
    user,
    isTwitchAuthenticated,

    // Methods
    loginWithTwitch,
    handleCallback,
    handleCallbackFromUrl,
    refreshToken,
    validateToken,
    storeIntendedRoute,
    getTwitchAuthUrl,
    handleOAuthError,
    generateState,
    validateState,
  };
};
