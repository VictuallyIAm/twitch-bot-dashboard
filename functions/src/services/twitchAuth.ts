import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import axios from "axios";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

const secretManager = new SecretManagerServiceClient();

interface TwitchTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

interface TwitchUserData {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

interface TwitchUserResponse {
  data: TwitchUserData[];
}

export class TwitchAuthService {
  private projectId: string;

  constructor() {
    this.projectId =
      process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "";
  }

  /**
   * Get secret from Google Cloud Secret Manager
   */
  private async getSecret(secretName: string): Promise<string> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await secretManager.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString();

      if (!payload) {
        throw new Error(`Secret ${secretName} is empty`);
      }

      return payload;
    } catch (error) {
      logger.error(`Error accessing secret ${secretName}:`, error);
      throw new Error(`Failed to access secret: ${secretName}`);
    }
  }

  /**
   * Generate Twitch OAuth authorization URL
   */
  async generateAuthUrl(state?: string): Promise<string> {
    try {
      const clientId = await this.getSecret("twitch-client-id");
      const redirectUri = await this.getSecret("twitch-redirect-uri");

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "user:read:email", // Add more scopes as needed
        state: state || this.generateRandomState(),
      });

      return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
    } catch (error) {
      logger.error("Error generating Twitch auth URL:", error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TwitchTokenResponse> {
    try {
      const clientId = await this.getSecret("twitch-client-id");
      const clientSecret = await this.getSecret("twitch-client-secret");
      const redirectUri = await this.getSecret("twitch-redirect-uri");

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });

      const response = await axios.post<TwitchTokenResponse>(
        "https://id.twitch.tv/oauth2/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("Error exchanging code for token:", error);
      if (axios.isAxiosError(error)) {
        logger.error("Twitch API error:", error.response?.data);
      }
      throw new Error("Failed to exchange authorization code for token");
    }
  }

  /**
   * Get user data from Twitch API
   */
  async getTwitchUserData(accessToken: string): Promise<TwitchUserData> {
    try {
      const clientId = await this.getSecret("twitch-client-id");

      const response = await axios.get<TwitchUserResponse>(
        "https://api.twitch.tv/helix/users",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Client-Id": clientId,
          },
        }
      );

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error("No user data returned from Twitch API");
      }

      return response.data.data[0];
    } catch (error) {
      logger.error("Error fetching Twitch user data:", error);
      if (axios.isAxiosError(error)) {
        logger.error("Twitch API error:", error.response?.data);
      }
      throw new Error("Failed to fetch user data from Twitch");
    }
  }

  /**
   * Create or update user in Firebase Auth and Firestore
   */
  async createOrUpdateFirebaseUser(
    twitchUser: TwitchUserData,
    twitchTokens: TwitchTokenResponse
  ): Promise<string> {
    try {
      const uid = `twitch:${twitchUser.id}`;

      // Create or update user in Firebase Auth
      let userRecord;
      try {
        userRecord = await admin
          .auth()
          .getUserByEmail(
            twitchUser.email || `twitch-${twitchUser.id}@noemail.local`
          );
      } catch (error) {
        // User doesn't exist, create new one
        userRecord = await admin.auth().createUser({
          uid,
          email: twitchUser.email || `twitch-${twitchUser.id}@noemail.local`,
          displayName: twitchUser.display_name,
          photoURL: twitchUser.profile_image_url,
          emailVerified: !!twitchUser.email,
        });
      }

      // Store additional user data in Firestore
      const userData = {
        twitchId: twitchUser.id,
        twitchLogin: twitchUser.login,
        displayName: twitchUser.display_name,
        email: twitchUser.email,
        profileImageUrl: twitchUser.profile_image_url,
        broadcasterType: twitchUser.broadcaster_type,
        description: twitchUser.description,
        viewCount: twitchUser.view_count,
        twitchCreatedAt: twitchUser.created_at,
        lastLogin: new Date().toISOString(),
        accessToken: twitchTokens.access_token, // Store encrypted in production
        refreshToken: twitchTokens.refresh_token, // Store encrypted in production
        tokenExpiresAt: new Date(
          Date.now() + twitchTokens.expires_in * 1000
        ).toISOString(),
      };

      await admin
        .firestore()
        .collection("users")
        .doc(userRecord.uid)
        .set(userData, { merge: true });

      logger.info(`User ${twitchUser.login} authenticated successfully`);
      return userRecord.uid;
    } catch (error) {
      logger.error("Error creating/updating Firebase user:", error);
      throw new Error("Failed to create or update user in Firebase");
    }
  }

  /**
   * Create custom Firebase token for authenticated user
   */
  async createCustomToken(
    uid: string,
    additionalClaims?: object
  ): Promise<string> {
    try {
      const customToken = await admin
        .auth()
        .createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error) {
      logger.error("Error creating custom token:", error);
      throw new Error("Failed to create authentication token");
    }
  }

  /**
   * Refresh Twitch access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TwitchTokenResponse> {
    try {
      const clientId = await this.getSecret("twitch-client-id");
      const clientSecret = await this.getSecret("twitch-client-secret");

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      const response = await axios.post<TwitchTokenResponse>(
        "https://id.twitch.tv/oauth2/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("Error refreshing access token:", error);
      throw new Error("Failed to refresh access token");
    }
  }

  /**
   * Validate Twitch access token
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get("https://id.twitch.tv/oauth2/validate", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      logger.error("Error validating access token:", error);
      return false;
    }
  }

  /**
   * Generate random state for OAuth security
   */
  private generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Complete OAuth flow
   */
  async completeOAuthFlow(
    code: string,
    state?: string
  ): Promise<{
    firebaseToken: string;
    user: TwitchUserData;
    uid: string;
  }> {
    try {
      // Exchange code for tokens
      const twitchTokens = await this.exchangeCodeForToken(code);

      // Get user data
      const twitchUser = await this.getTwitchUserData(
        twitchTokens.access_token
      );

      // Create or update Firebase user
      const uid = await this.createOrUpdateFirebaseUser(
        twitchUser,
        twitchTokens
      );

      // Create custom Firebase token
      const firebaseToken = await this.createCustomToken(uid, {
        twitchId: twitchUser.id,
        twitchLogin: twitchUser.login,
        provider: "twitch",
      });

      return {
        firebaseToken,
        user: twitchUser,
        uid,
      };
    } catch (error) {
      logger.error("Error completing OAuth flow:", error);
      throw error;
    }
  }
}
