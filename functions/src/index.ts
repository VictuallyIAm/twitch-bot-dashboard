/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { TwitchAuthService } from "./services/twitchAuth";

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Initialize Twitch Auth Service
const twitchAuth = new TwitchAuthService();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.web.app", "https://your-domain.firebaseapp.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Authentication middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authorization.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// User routes
app.get("/api/user/profile", authenticateUser, async (req: any, res) => {
  try {
    const user = req.user;
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.name || user.email,
      emailVerified: user.email_verified,
    });
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bot configuration routes
app.get("/api/bot/config", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const configDoc = await admin
      .firestore()
      .collection("botConfigs")
      .doc(userId)
      .get();

    if (!configDoc.exists) {
      return res.json({
        botName: "",
        twitchChannel: "",
        enabled: false,
        commands: [],
      });
    }

    res.json(configDoc.data());
  } catch (error) {
    logger.error("Error fetching bot config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bot/config", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const config = req.body;

    await admin
      .firestore()
      .collection("botConfigs")
      .doc(userId)
      .set(
        {
          ...config,
          userId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    res.json({ success: true, message: "Configuration updated successfully" });
  } catch (error) {
    logger.error("Error updating bot config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bot commands routes
app.get("/api/bot/commands", authenticateUser, async (req: any, res: any) => {
  try {
    const userId = req.user.uid;
    const commandsSnapshot = await admin
      .firestore()
      .collection("botCommands")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const commands = commandsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(commands);
  } catch (error) {
    logger.error("Error fetching bot commands:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bot/commands", authenticateUser, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { name, response, enabled = true } = req.body;

    if (!name || !response) {
      return res
        .status(400)
        .json({ error: "Command name and response are required" });
    }

    const commandData = {
      name: name.toLowerCase(),
      response,
      enabled,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await admin
      .firestore()
      .collection("botCommands")
      .add(commandData);

    return res.json({
      success: true,
      id: docRef.id,
      command: { id: docRef.id, ...commandData },
    });
  } catch (error) {
    logger.error("Error creating bot command:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/bot/commands/:id", authenticateUser, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const commandId = req.params.id;
    const updates = req.body;

    // Verify ownership
    const commandDoc = await admin
      .firestore()
      .collection("botCommands")
      .doc(commandId)
      .get();

    if (!commandDoc.exists) {
      return res.status(404).json({ error: "Command not found" });
    }

    if (commandDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await admin
      .firestore()
      .collection("botCommands")
      .doc(commandId)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

    return res.json({ success: true, message: "Command updated successfully" });
  } catch (error) {
    logger.error("Error updating bot command:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/bot/commands/:id", authenticateUser, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const commandId = req.params.id;

    // Verify ownership
    const commandDoc = await admin
      .firestore()
      .collection("botCommands")
      .doc(commandId)
      .get();

    if (!commandDoc.exists) {
      return res.status(404).json({ error: "Command not found" });
    }

    if (commandDoc.data()?.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await admin.firestore().collection("botCommands").doc(commandId).delete();

    return res.json({ success: true, message: "Command deleted successfully" });
  } catch (error) {
    logger.error("Error deleting bot command:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Twitch OAuth routes

// Initiate Twitch OAuth flow
app.get("/auth/twitch", async (req: any, res: any) => {
  try {
    const state = req.query.state as string;
    const authUrl = await twitchAuth.generateAuthUrl(state);

    // Redirect to Twitch OAuth
    res.redirect(authUrl);
  } catch (error) {
    logger.error("Error initiating Twitch OAuth:", error);
    res.status(500).json({ error: "Failed to initiate Twitch authentication" });
  }
});

// Handle Twitch OAuth callback
app.get("/auth/twitch/callback", async (req: any, res: any) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      logger.error("Twitch OAuth error:", error);
      return res.redirect("/login?error=oauth_denied");
    }

    if (!code) {
      logger.error("No authorization code received");
      return res.redirect("/login?error=no_code");
    }

    // Complete OAuth flow
    const result = await twitchAuth.completeOAuthFlow(
      code as string,
      state as string
    );

    // For web applications, you might want to:
    // 1. Set the token in a secure cookie
    // 2. Redirect to a success page with the token
    // 3. Or return a page that handles the token client-side

    // Option 1: Redirect with token (less secure, but simple)
    const redirectUrl = `/login/success?token=${encodeURIComponent(
      result.firebaseToken
    )}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
    res.redirect(redirectUrl);

    // Option 2: Set secure cookie and redirect (more secure)
    // res.cookie('auth_token', result.firebaseToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 3600000 // 1 hour
    // });
    // res.redirect('/dashboard');
  } catch (error) {
    logger.error("Error in Twitch OAuth callback:", error);
    res.redirect("/login?error=auth_failed");
  }
});

// Get Twitch auth URL (API endpoint)
app.get("/api/auth/twitch/url", async (req: any, res: any) => {
  try {
    const state = req.query.state as string;
    const authUrl = await twitchAuth.generateAuthUrl(state);

    res.json({ authUrl });
  } catch (error) {
    logger.error("Error generating Twitch auth URL:", error);
    res.status(500).json({ error: "Failed to generate authentication URL" });
  }
});

// Exchange authorization code for Firebase token (API endpoint)
app.post("/api/auth/twitch/token", async (req: any, res: any) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const result = await twitchAuth.completeOAuthFlow(code, state);

    res.json({
      success: true,
      firebaseToken: result.firebaseToken,
      user: {
        uid: result.uid,
        twitchId: result.user.id,
        login: result.user.login,
        displayName: result.user.display_name,
        email: result.user.email,
        profileImageUrl: result.user.profile_image_url,
      },
    });
  } catch (error) {
    logger.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Failed to authenticate with Twitch" });
  }
});

// Refresh Twitch token
app.post(
  "/api/auth/twitch/refresh",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const userId = req.user.uid;

      // Get user's refresh token from Firestore
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      if (!userData?.refreshToken) {
        return res.status(400).json({ error: "No refresh token available" });
      }

      // Refresh the token
      const newTokens = await twitchAuth.refreshAccessToken(
        userData.refreshToken
      );

      // Update user data with new tokens
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          tokenExpiresAt: new Date(
            Date.now() + newTokens.expires_in * 1000
          ).toISOString(),
          updatedAt: new Date().toISOString(),
        });

      res.json({ success: true, message: "Token refreshed successfully" });
    } catch (error) {
      logger.error("Error refreshing Twitch token:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  }
);

// Validate current Twitch token
app.get(
  "/api/auth/twitch/validate",
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const userId = req.user.uid;

      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      if (!userData?.accessToken) {
        return res.json({ valid: false, reason: "No access token" });
      }

      const isValid = await twitchAuth.validateAccessToken(
        userData.accessToken
      );

      res.json({
        valid: isValid,
        expiresAt: userData.tokenExpiresAt,
      });
    } catch (error) {
      logger.error("Error validating Twitch token:", error);
      res.status(500).json({ error: "Failed to validate token" });
    }
  }
);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Export the Express app as a Firebase Function
export const api = onRequest(
  {
    cors: true,
    region: "europe-west1",
  },
  app
);

// Keep the original helloWorld function for testing
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});
