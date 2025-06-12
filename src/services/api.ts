import { getAuth } from "firebase/auth";

const API_BASE = import.meta.env.PROD
  ? "/api" // In production, API is served from the same domain
  : "http://localhost:3000/api"; // In development, API runs on different port

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (error) {
        console.error("Error getting auth token:", error);
        return null;
      }
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; version: string }>(
      "/health"
    );
  }

  // User API
  async getUserProfile() {
    return this.request<{
      uid: string;
      email: string;
      displayName: string;
      emailVerified: boolean;
    }>("/user/profile");
  }

  // Bot Configuration API
  async getBotConfig() {
    return this.request<{
      botName: string;
      twitchChannel: string;
      enabled: boolean;
      commands: any[];
    }>("/bot/config");
  }

  async updateBotConfig(config: {
    botName: string;
    twitchChannel: string;
    enabled: boolean;
  }) {
    return this.request<{ success: boolean; message: string }>("/bot/config", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  // Bot Commands API
  async getBotCommands() {
    return this.request<
      Array<{
        id: string;
        name: string;
        response: string;
        enabled: boolean;
        userId: string;
        createdAt: string;
        updatedAt: string;
      }>
    >("/bot/commands");
  }

  async createBotCommand(command: {
    name: string;
    response: string;
    enabled?: boolean;
  }) {
    return this.request<{
      success: boolean;
      id: string;
      command: any;
    }>("/bot/commands", {
      method: "POST",
      body: JSON.stringify(command),
    });
  }

  async updateBotCommand(
    id: string,
    updates: {
      name?: string;
      response?: string;
      enabled?: boolean;
    }
  ) {
    return this.request<{ success: boolean; message: string }>(
      `/bot/commands/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteBotCommand(id: string) {
    return this.request<{ success: boolean; message: string }>(
      `/bot/commands/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // Test endpoint
  async test() {
    return this.request<{ message: string; timestamp: string }>("/test");
  }

  // Twitch OAuth API
  async getTwitchAuthUrl(state?: string) {
    const params = state ? `?state=${encodeURIComponent(state)}` : "";
    return this.request<{ authUrl: string }>(`/auth/twitch/url${params}`);
  }

  async exchangeTwitchCode(code: string, state?: string) {
    return this.request<{
      success: boolean;
      firebaseToken: string;
      user: {
        uid: string;
        twitchId: string;
        login: string;
        displayName: string;
        email?: string;
        profileImageUrl: string;
      };
    }>("/auth/twitch/token", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    });
  }

  async refreshTwitchToken() {
    return this.request<{ success: boolean; message: string }>(
      "/auth/twitch/refresh",
      {
        method: "POST",
      }
    );
  }

  async validateTwitchToken() {
    return this.request<{
      valid: boolean;
      reason?: string;
      expiresAt?: string;
    }>("/auth/twitch/validate");
  }
}

export const apiService = new ApiService();
