<template>
  <div v-if="!userBotSettings">
    <v-skeleton-loader type="card" />
    <v-skeleton-loader type="card" />
    <v-skeleton-loader type="card" />
  </div>
  <div v-else>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ $t("botCommands.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("botCommands.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          :label="$t('botCommands.searchCommands')"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          {{ $t("botCommands.addCommand") }}
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>
        <v-icon class="me-2">mdi-robot</v-icon>
        {{ $t("botCommands.commandList") }}
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredCommands"
        :search="search"
        item-value="id"
        class="elevation-0"
        no-data-text="No commands found"
      >
        <template v-slot:item.command="{ item }">
          <v-chip color="primary" variant="outlined" size="small">
            !{{ item.command }}
          </v-chip>
        </template>

        <template v-slot:item.cooldown="{ item }">
          {{ item.cooldown }}s
        </template>

        <template v-slot:item.permission="{ item }">
          <v-chip
            :color="getPermissionColor(item.permission)"
            variant="tonal"
            size="small"
          >
            {{ $t(`botCommands.${item.permission}`) }}
          </v-chip>
        </template>

        <template v-slot:item.usage="{ item }">
          <v-chip variant="outlined" size="small">
            {{ item.usageCount }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="editCommand(item)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deleteCommand(item.id)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Command Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            {{
              editingCommand
                ? $t("botCommands.editCommand")
                : $t("botCommands.addEditCommand")
            }}
          </span>
        </v-card-title>

        <v-card-text>
          <v-form ref="formRef" @submit.prevent="saveCommand">
            <v-text-field
              v-model="commandForm.command"
              :label="$t('botCommands.commandWithoutExclamation')"
              variant="outlined"
              :rules="commandRules"
              class="mb-4"
              required
            ></v-text-field>

            <v-textarea
              v-model="commandForm.response"
              :label="$t('botCommands.response')"
              variant="outlined"
              :rules="responseRules"
              rows="3"
              class="mb-4"
              required
            ></v-textarea>

            <v-text-field
              v-model.number="commandForm.cooldown"
              :label="$t('botCommands.cooldownSeconds')"
              type="number"
              variant="outlined"
              min="0"
              max="300"
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="commandForm.permission"
              :label="$t('botCommands.permissionLevel')"
              :items="permissionOptions"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-switch
              v-model="commandForm.enabled"
              :label="$t('botCommands.enableCommand')"
              color="primary"
              class="mb-4"
            ></v-switch>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="primary" variant="flat" @click="saveCommand">
            {{ editingCommand ? $t("botCommands.update") : $t("common.save") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore, type command } from "@/stores/userStore";
import { storeToRefs } from "pinia";
const { t } = useI18n();
const { userBotSettings } = storeToRefs(useUserStore());

// Data
const search = ref("");
const dialog = ref(false);
const editingCommand = ref(false);
const formRef = ref();
const commandForm = ref<command>({
  id: 0,
  command: "",
  response: "",
  cooldown: 5,
  permission: "everyone",
  enabled: true,
  usageCount: 0,
});

// Computed
const headers = computed(() => [
  { title: t("botCommands.command"), key: "command", sortable: true },
  { title: t("botCommands.response"), key: "response", sortable: false },
  { title: t("botCommands.cooldown"), key: "cooldown", sortable: true },
  { title: t("botCommands.permission"), key: "permission", sortable: true },
  { title: t("botCommands.usage"), key: "usage", sortable: true },
  { title: t("common.actions"), key: "actions", sortable: false },
]);

const permissionOptions = computed(() => [
  { title: t("botCommands.everyone"), value: "everyone" },
  { title: t("botCommands.subscribers"), value: "subscribers" },
  { title: t("botCommands.moderators"), value: "moderators" },
  { title: t("botCommands.broadcaster"), value: "broadcaster" },
]);

const filteredCommands = computed(() => {
  if (!search.value) return userBotSettings.value?.botCommands.commands;
  return userBotSettings.value?.botCommands.commands.filter(
    (cmd) =>
      cmd.command.toLowerCase().includes(search.value.toLowerCase()) ||
      cmd.response.toLowerCase().includes(search.value.toLowerCase())
  );
});

const commandRules = computed(() => [
  (v: string) => !!v || t("botCommands.commandRequired"),
  (v: string) => v.length >= 2 || t("botCommands.commandMinLength"),
  (v: string) => /^[a-zA-Z0-9_]+$/.test(v) || t("botCommands.commandFormat"),
]);

const responseRules = computed(() => [
  (v: string) => !!v || t("botCommands.responseRequired"),
  (v: string) => v.length >= 5 || t("botCommands.responseMinLength"),
]);

// Methods
const getPermissionColor = (permission: string) => {
  const colors = {
    everyone: "success",
    subscribers: "info",
    moderators: "warning",
    broadcaster: "error",
  };
  return colors[permission as keyof typeof colors] || "primary";
};

const openAddDialog = () => {
  editingCommand.value = false;
  commandForm.value = {
    id: Date.now(),
    command: "",
    response: "",
    cooldown: 5,
    permission: "everyone",
    enabled: true,
    usageCount: 0,
  };
  dialog.value = true;
};

const editCommand = (command: any) => {
  editingCommand.value = true;
  commandForm.value = { ...command };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  formRef.value?.resetValidation();
};

const saveCommand = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  if (editingCommand.value) {
    const index = userBotSettings.value?.botCommands.commands.findIndex(
      (cmd) => cmd.id === commandForm.value.id
    );
    if (userBotSettings.value && index && index !== -1) {
      userBotSettings.value.botCommands.commands[index] = {
        ...commandForm.value,
      } as any;
    }
  } else {
    const newCommand = {
      ...commandForm.value,
      id: Date.now(),
      usage: 0,
    };
    userBotSettings.value?.botCommands.commands.push(newCommand as any);
  }

  closeDialog();
};

const deleteCommand = (id: number) => {
  if (userBotSettings.value) {
    userBotSettings.value.botCommands.commands =
      userBotSettings.value.botCommands.commands.filter((cmd) => cmd.id !== id);
  }
};
</script>

<style lang="scss" scoped>
.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-data-table {
  .v-data-table__td {
    padding: 12px 16px;
  }
}

.v-chip {
  font-weight: 500;
}
</style>
