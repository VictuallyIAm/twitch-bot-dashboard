import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";
import { getCurrentUser } from "./auth";

// User Profile interface
export interface UserProfile {
  id: string;
  twitchId: string;
  email: string;
  displayName: string;
  login: string;
  profileImageUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Bot Command interface
export interface BotCommand {
  id?: string;
  command: string;
  response: string;
  cooldown: number;
  permission: "everyone" | "subscribers" | "moderators" | "broadcaster";
  enabled: boolean;
  usage: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Bot Settings interface
export interface BotSettings {
  username: string;
  prefix: string;
  channel: string;
  autoConnect: boolean;
  updatedAt: Timestamp;
}

// Moderation Settings interface
export interface ModerationSettings {
  autoModeration: boolean;
  blockLinks: boolean;
  capsFilter: boolean;
  symbolSpamFilter: boolean;
  slowMode: number;
  maxMessageLength: number;
  followersOnly: number;
  bannedWords: string[];
  updatedAt: Timestamp;
}

// AI Settings interface
export interface AISettings {
  enabled: boolean;
  model: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  cooldown: number;
  moderatorOnly: boolean;
  filterProfanity: boolean;
  triggerWord: string;
  sarcasm: number;
  humor: number;
  friendliness: number;
  systemPrompt: string;
  updatedAt: Timestamp;
}

// Complete User Document interface
export interface UserDocument {
  profile: UserProfile;
  botSettings: BotSettings;
  moderationSettings: ModerationSettings;
  aiSettings: AISettings;
}

// Helper function to get user ID
const getUserId = () => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");
  return user.uid;
};

// User operations
export const users = {
  // Create or update user profile
  async createOrUpdate(
    userProfile: Omit<UserProfile, "createdAt" | "updatedAt">
  ): Promise<void> {
    const userId = getUserId();
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const now = Timestamp.now();

    if (userDoc.exists()) {
      // Update existing user profile
      await updateDoc(userRef, {
        "profile.displayName": userProfile.displayName,
        "profile.login": userProfile.login,
        "profile.email": userProfile.email,
        "profile.profileImageUrl": userProfile.profileImageUrl,
        "profile.updatedAt": now,
      });
    } else {
      // Create new user with default settings
      const defaultBotSettings: BotSettings = {
        username: "TwitchBot",
        prefix: "!",
        channel: userProfile.login,
        autoConnect: true,
        updatedAt: now,
      };

      const defaultModerationSettings: ModerationSettings = {
        autoModeration: false,
        blockLinks: false,
        capsFilter: false,
        symbolSpamFilter: false,
        slowMode: 0,
        maxMessageLength: 500,
        followersOnly: 0,
        bannedWords: [],
        updatedAt: now,
      };

      const defaultAISettings: AISettings = {
        enabled: false,
        model: "gpt-3.5-turbo",
        apiKey: "",
        maxTokens: 150,
        temperature: 0.7,
        cooldown: 30,
        moderatorOnly: false,
        filterProfanity: true,
        triggerWord: "bot",
        sarcasm: 25,
        humor: 50,
        friendliness: 75,
        systemPrompt: `You are a helpful and entertaining Twitch chat bot. Your role is to:

1. Engage with viewers in a friendly and welcoming manner
2. Answer questions about the stream and streamer
3. Provide helpful information when requested
4. Keep the chat positive and fun
5. Use appropriate humor and personality

Guidelines:
- Keep responses concise (1-2 sentences max)
- Match the energy of the chat
- Be respectful and inclusive
- Avoid controversial topics
- Use emotes and Twitch culture appropriately

Remember: You represent the streamer and their community!`,
        updatedAt: now,
      };

      const userDocument: UserDocument = {
        profile: {
          ...userProfile,
          createdAt: now,
          updatedAt: now,
        },
        botSettings: defaultBotSettings,
        moderationSettings: defaultModerationSettings,
        aiSettings: defaultAISettings,
      };

      await setDoc(userRef, userDocument);
    }
  },

  // Get user document
  async get(): Promise<UserDocument | null> {
    const userId = getUserId();
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return null;
    return userDoc.data() as UserDocument;
  },
};

// Bot Commands CRUD operations (stored as subcollection)
export const botCommands = {
  // Get all commands for current user
  async getAll(): Promise<BotCommand[]> {
    const userId = getUserId();
    const q = query(
      collection(db, "users", userId, "commands"),
      orderBy("command")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as BotCommand)
    );
  },

  // Add new command
  async add(
    command: Omit<BotCommand, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const userId = getUserId();
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "users", userId, "commands"), {
      ...command,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  // Update command
  async update(id: string, updates: Partial<BotCommand>): Promise<void> {
    const userId = getUserId();
    const docRef = doc(db, "users", userId, "commands", id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete command
  async delete(id: string): Promise<void> {
    const userId = getUserId();
    await deleteDoc(doc(db, "users", userId, "commands", id));
  },

  // Listen to real-time updates
  onSnapshot(callback: (commands: BotCommand[]) => void) {
    const userId = getUserId();
    const q = query(
      collection(db, "users", userId, "commands"),
      orderBy("command")
    );
    return onSnapshot(q, (snapshot) => {
      const commands = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as BotCommand)
      );
      callback(commands);
    });
  },
};

// Bot Settings operations (nested in user document)
export const botSettings = {
  // Get settings for current user
  async get(): Promise<BotSettings | null> {
    const userDoc = await users.get();
    return userDoc?.botSettings || null;
  },

  // Save settings
  async save(settings: Omit<BotSettings, "updatedAt">): Promise<void> {
    const userId = getUserId();
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "botSettings.username": settings.username,
      "botSettings.prefix": settings.prefix,
      "botSettings.channel": settings.channel,
      "botSettings.autoConnect": settings.autoConnect,
      "botSettings.updatedAt": Timestamp.now(),
    });
  },
};

// Moderation Settings operations (nested in user document)
export const moderationSettings = {
  // Get settings for current user
  async get(): Promise<ModerationSettings | null> {
    const userDoc = await users.get();
    return userDoc?.moderationSettings || null;
  },

  // Save settings
  async save(settings: Omit<ModerationSettings, "updatedAt">): Promise<void> {
    const userId = getUserId();
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "moderationSettings.autoModeration": settings.autoModeration,
      "moderationSettings.blockLinks": settings.blockLinks,
      "moderationSettings.capsFilter": settings.capsFilter,
      "moderationSettings.symbolSpamFilter": settings.symbolSpamFilter,
      "moderationSettings.slowMode": settings.slowMode,
      "moderationSettings.maxMessageLength": settings.maxMessageLength,
      "moderationSettings.followersOnly": settings.followersOnly,
      "moderationSettings.bannedWords": settings.bannedWords,
      "moderationSettings.updatedAt": Timestamp.now(),
    });
  },
};

// AI Settings operations (nested in user document)
export const aiSettings = {
  // Get settings for current user
  async get(): Promise<AISettings | null> {
    const userDoc = await users.get();
    return userDoc?.aiSettings || null;
  },

  // Save settings
  async save(settings: Omit<AISettings, "updatedAt">): Promise<void> {
    const userId = getUserId();
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "aiSettings.enabled": settings.enabled,
      "aiSettings.model": settings.model,
      "aiSettings.apiKey": settings.apiKey,
      "aiSettings.maxTokens": settings.maxTokens,
      "aiSettings.temperature": settings.temperature,
      "aiSettings.cooldown": settings.cooldown,
      "aiSettings.moderatorOnly": settings.moderatorOnly,
      "aiSettings.filterProfanity": settings.filterProfanity,
      "aiSettings.triggerWord": settings.triggerWord,
      "aiSettings.sarcasm": settings.sarcasm,
      "aiSettings.humor": settings.humor,
      "aiSettings.friendliness": settings.friendliness,
      "aiSettings.systemPrompt": settings.systemPrompt,
      "aiSettings.updatedAt": Timestamp.now(),
    });
  },
};

// Analytics operations (stored as subcollection)
export const analytics = {
  // Log command usage
  async logCommandUsage(command: string): Promise<void> {
    const userId = getUserId();
    await addDoc(collection(db, "users", userId, "analytics"), {
      type: "command_usage",
      command,
      timestamp: Timestamp.now(),
    });
  },

  // Get command usage stats
  async getCommandStats(
    days: number = 7
  ): Promise<{ command: string; count: number }[]> {
    const userId = getUserId();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(db, "users", userId, "analytics"),
      where("type", "==", "command_usage"),
      where("timestamp", ">=", Timestamp.fromDate(startDate))
    );

    const snapshot = await getDocs(q);
    const stats: { [key: string]: number } = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      stats[data.command] = (stats[data.command] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count);
  },
};
