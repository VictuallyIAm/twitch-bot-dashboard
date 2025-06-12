import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { User } from "firebase/auth";
import { authState } from "../firebase/auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(true);

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const userDisplayName = computed(() => user.value?.displayName || "User");
  const userEmail = computed(() => user.value?.email || "");
  const userPhotoURL = computed(() => user.value?.photoURL || "");

  // Actions
  const setUser = (newUser: User | null) => {
    user.value = newUser;
    loading.value = false;
  };

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading;
  };

  const logout = async () => {
    try {
      // Firebase auth logout is handled in firebase/auth.ts
      user.value = null;
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    // Watch for changes in the authState from firebase/auth.ts
    watch(
      () => authState.user,
      (newUser) => {
        setUser(newUser);
      },
      { immediate: true }
    );

    // Also watch for loading state changes
    watch(
      () => authState.loading,
      (isLoading) => {
        setLoading(isLoading);
      },
      { immediate: true }
    );
  };

  return {
    // State
    user,
    loading,
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    // Actions
    setUser,
    setLoading,
    logout,
    initializeAuth,
  };
});
