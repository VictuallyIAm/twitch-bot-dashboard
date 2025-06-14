import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { collection, doc } from "firebase/firestore";
import { botSettingsRef } from "@/firebase";
import { useCollection, useDocument } from "vuefire";

export interface User {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
  created_at: string;
}

type gptModel = "gpt-4o" | "gpt-4o-mini" | "gpt-3.5-turbo";

export interface command {
  id: number;
  command: string;
  response: string;
  cooldown: number;
  permission: string;
  enabled: boolean;
  usageCount: number;
}

export interface topUser {
  username: string;
  messages: number;
}

type activityType = "message" | "command" | "action";

export interface activity {
  id: number;
  type: activityType;
  message?: string;
  command?: string;
  action?: string;
  timestamp: string;
}

export interface botSettings {
  overview: {
    chattersUsedBot: number;
    messagesToday: number;
    commandsUsed: command[];
    recentActivity: activity[];
  };
  botCommands: {
    commands: command[];
    totalCommands: number;
  };
  moderation: {
    enabled: boolean;
    blockLinks: boolean;
    blockCaps: boolean;
    blockSpam: boolean;
    recentActions: [];
    bannedWords: string[];
  };
  analytics: {
    commandsUsed: command[];
    topUsers: topUser[];
  };
  aiSettings: {
    idAIEnabled: boolean;
    model: gptModel;
    maxTokens: number;
    creativity: number;
    sarcasm: number;
    humor: number;
    friendliness: number;
    systemPrompt: string;
    triggerWord: string;
    requestsPerMinute: number;
    moderatorOnly: boolean;
  };
  tools: {
    giveaway: {
      enabled: boolean;
      giveaway: [];
    };
  };
  generalSettings: {
    commandPrefix: string;
    reactOnFollow: boolean;
    reactOnSubscribe: boolean;
    reactOnRaids: boolean;
    reactOnDonate: boolean;
    autoConnectOnStartup: boolean;
  };
}

export const useUserStore = defineStore("user", () => {
  // State
  const user = ref<User | null>(null);
  const isLoggedIn = ref(false);
  const accessToken = ref("");

  // Default bot settings with all proper default values
  const createDefaultBotSettings = (): botSettings => ({
    overview: {
      chattersUsedBot: 0,
      messagesToday: 0,
      commandsUsed: [],
      recentActivity: [],
    },
    botCommands: {
      commands: [],
      totalCommands: 0,
    },
    moderation: {
      enabled: false,
      blockLinks: false,
      blockCaps: false,
      blockSpam: false,
      recentActions: [],
      bannedWords: [],
    },
    analytics: {
      commandsUsed: [],
      topUsers: [],
    },
    aiSettings: {
      idAIEnabled: false,
      model: "gpt-3.5-turbo",
      maxTokens: 0,
      creativity: 0,
      sarcasm: 0,
      humor: 0,
      friendliness: 0,
      systemPrompt: "",
      triggerWord: "",
      requestsPerMinute: 0,
      moderatorOnly: false,
    },
    tools: {
      giveaway: {
        enabled: false,
        giveaway: [],
      },
    },
    generalSettings: {
      commandPrefix: "",
      reactOnFollow: false,
      reactOnSubscribe: false,
      reactOnRaids: false,
      reactOnDonate: false,
      autoConnectOnStartup: false,
    },
  });

  const userBotSettings = ref<botSettings | null>(null);
  const botSettingsCollection = useCollection(botSettingsRef);

  // Firebase bot settings management
  // const loadOrCreateBotSettings = async (userId: string) => {

  //   const botSettings = useDocument(doc(botSettingsRef, userId));
  //   if (botSettings.value) {
  //     userBotSettings.value = botSettings.value as botSettings;
  //   } else {
  //     userBotSettings.value = createDefaultBotSettings();
  //     botSettings.value = userBotSettings.value;
  //   }
  // };

  // Actions
  const setUser = async (userObject: User) => {
    user.value = userObject;
    isLoggedIn.value = true;
    console.log(botSettingsCollection.value);
    // Load or create bot settings for this user
    // await loadOrCreateBotSettings(userObject.id);
  };

  const getUser = async () => {
    const response = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
        "Client-Id": "66npg4ky8uovt9yhvzujh35fgol9rt",
      },
    });

    const result = await response.json();
    await setUser(result.data[0]);
  };

  const clearUser = () => {
    user.value = null;
    isLoggedIn.value = false;
  };

  const setAuthTokens = (token: string) => {
    accessToken.value = token;
  };

  return {
    user,
    isLoggedIn,
    accessToken,
    userBotSettings,
    setUser,
    getUser,
    clearUser,
    setAuthTokens,
  };
});
