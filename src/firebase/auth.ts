import {
  signInWithCustomToken,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";

export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  email: string;
  profile_image_url: string;
}

export interface AuthState {
  user: User | null;
  twitchUser: TwitchUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Create a reactive auth state
export const authState: AuthState = {
  user: null,
  twitchUser: null,
  isAuthenticated: false,
  loading: true,
};

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
  authState.user = user;
  authState.isAuthenticated = !!user;
  authState.loading = false;

  // Get Twitch user data from localStorage if available
  if (user) {
    const storedTwitchUser = localStorage.getItem("twitchUser");
    if (storedTwitchUser) {
      authState.twitchUser = JSON.parse(storedTwitchUser);
    }
  } else {
    authState.twitchUser = null;
    // Clean up Twitch data when user signs out
    localStorage.removeItem("twitchUser");
    localStorage.removeItem("twitch_access_token");
    localStorage.removeItem("twitch_refresh_token");
  }
});

// Sign in with custom token (from Firebase Functions after Twitch OAuth)
export const signInWithTwitchToken = async (
  customToken: string,
  twitchUser: TwitchUser
) => {
  try {
    const result = await signInWithCustomToken(auth, customToken);

    // Store Twitch user data
    authState.twitchUser = twitchUser;
    localStorage.setItem("twitchUser", JSON.stringify(twitchUser));

    return result.user;
  } catch (error) {
    console.error("Error signing in with custom token:", error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    // authState will be updated automatically by onAuthStateChanged
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return authState.isAuthenticated;
};

// Get Twitch user data
export const getTwitchUser = () => {
  return authState.twitchUser;
};
