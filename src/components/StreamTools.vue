<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ $t("streamTools.title") }}
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          {{ $t("streamTools.description") }}
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-gift</v-icon>
            {{ $t("streamTools.giveaways") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="giveaway.keyword"
              :label="$t('streamTools.entryKeyword')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="giveaway.prize"
              :label="$t('streamTools.prizeDescription')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="giveaway.duration"
              :label="$t('streamTools.durationMinutes')"
              type="number"
              variant="outlined"
              min="1"
              max="60"
              class="mb-4"
            ></v-text-field>

            <v-btn
              v-if="!giveaway.active"
              color="success"
              prepend-icon="mdi-play"
              @click="startGiveaway"
              block
            >
              {{ $t("streamTools.startGiveaway") }}
            </v-btn>

            <v-btn
              v-else
              color="error"
              prepend-icon="mdi-stop"
              @click="stopGiveaway"
              block
            >
              {{ $t("streamTools.stopGiveaway") }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-poll</v-icon>
            {{ $t("streamTools.polls") }}
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="poll.question"
              :label="$t('streamTools.pollQuestion')"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-for="(option, index) in poll.options"
              :key="index"
              v-model="poll.options[index]"
              :label="$t('streamTools.option', { number: index + 1 })"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-plus"
              @click="addPollOption"
              class="mb-4"
              block
            >
              {{ $t("streamTools.addOption") }}
            </v-btn>

            <v-btn
              v-if="!poll.active"
              color="primary"
              prepend-icon="mdi-play"
              @click="startPoll"
              block
            >
              {{ $t("streamTools.startPoll") }}
            </v-btn>

            <v-btn
              v-else
              color="warning"
              prepend-icon="mdi-stop"
              @click="endPoll"
              block
            >
              {{ $t("streamTools.endPoll") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-music</v-icon>
            {{ $t("streamTools.songRequests") }}
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="songRequests.enabled"
              :label="$t('streamTools.enableSongRequests')"
              color="primary"
              class="mb-4"
            ></v-switch>

            <v-text-field
              v-model="songRequests.command"
              :label="$t('streamTools.requestCommand')"
              variant="outlined"
              :disabled="!songRequests.enabled"
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="songRequests.platform"
              :label="$t('streamTools.musicPlatform')"
              :items="musicPlatforms"
              variant="outlined"
              :disabled="!songRequests.enabled"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model.number="songRequests.maxLength"
              :label="$t('streamTools.maxSongLengthMinutes')"
              type="number"
              variant="outlined"
              min="1"
              max="10"
              :disabled="!songRequests.enabled"
            ></v-text-field>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-counter</v-icon>
            {{ $t("streamTools.counters") }}
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddCounterDialog = true"
            >
              {{ $t("streamTools.addCounter") }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div
              v-for="counter in counters"
              :key="counter.id"
              class="d-flex align-center mb-3"
            >
              <span class="text-subtitle-1 flex-grow-1">{{
                counter.name
              }}</span>
              <v-chip class="me-2" variant="outlined">{{
                counter.value
              }}</v-chip>
              <v-btn
                icon="mdi-minus"
                size="small"
                variant="text"
                @click="decrementCounter(counter.id)"
              ></v-btn>
              <v-btn
                icon="mdi-plus"
                size="small"
                variant="text"
                @click="incrementCounter(counter.id)"
              ></v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-timer</v-icon>
            {{ $t("streamTools.timers") }}
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddTimerDialog = true"
            >
              {{ $t("streamTools.addTimer") }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="timer in timers"
                :key="timer.id"
                :title="timer.name"
                :subtitle="
                  $t('streamTools.everyMinutes', { interval: timer.interval })
                "
              >
                <template v-slot:append>
                  <v-switch
                    v-model="timer.active"
                    color="primary"
                    hide-details
                    @change="toggleTimer(timer.id)"
                  ></v-switch>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Counter Dialog -->
    <v-dialog v-model="showAddCounterDialog" max-width="400px">
      <v-card>
        <v-card-title>{{ $t("streamTools.addCounter") }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newCounter.name"
            :label="$t('streamTools.counterName')"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showAddCounterDialog = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="primary" @click="addCounter">
            {{ $t("common.add") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Timer Dialog -->
    <v-dialog v-model="showAddTimerDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ $t("streamTools.addTimer") }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTimer.name"
            :label="$t('streamTools.timerName')"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="newTimer.message"
            :label="$t('streamTools.message')"
            variant="outlined"
            rows="3"
            class="mb-4"
          ></v-textarea>

          <v-text-field
            v-model.number="newTimer.interval"
            :label="$t('streamTools.intervalMinutes')"
            type="number"
            variant="outlined"
            min="1"
            max="60"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showAddTimerDialog = false">
            {{ $t("common.cancel") }}
          </v-btn>
          <v-btn color="primary" @click="addTimer">
            {{ $t("common.add") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Data
const showAddCounterDialog = ref(false);
const showAddTimerDialog = ref(false);

const giveaway = ref({
  keyword: "win",
  prize: "Steam Game Key",
  duration: 5,
  active: false,
});

const poll = ref({
  question: "",
  options: ["", ""],
  active: false,
});

const songRequests = ref({
  enabled: true,
  command: "!sr",
  platform: "spotify",
  maxLength: 5,
});

const musicPlatforms = computed(() => [
  { title: t("aiSettings.spotify"), value: "spotify" },
  { title: t("aiSettings.youtube"), value: "youtube" },
  { title: t("aiSettings.soundcloud"), value: "soundcloud" },
]);

const counters = ref([
  { id: 1, name: "Deaths", value: 12 },
  { id: 2, name: "Wins", value: 8 },
  { id: 3, name: "Fails", value: 23 },
]);

const timers = ref([
  {
    id: 1,
    name: "Social Media",
    message: "Follow me on Twitter @streamer!",
    interval: 15,
    active: true,
  },
  {
    id: 2,
    name: "Discord",
    message: "Join our Discord server for updates!",
    interval: 20,
    active: false,
  },
]);

const newCounter = ref({
  name: "",
});

const newTimer = ref({
  name: "",
  message: "",
  interval: 10,
});

// Methods
const startGiveaway = () => {
  giveaway.value.active = true;
  console.log("Giveaway started");
};

const stopGiveaway = () => {
  giveaway.value.active = false;
  console.log("Giveaway stopped");
};

const addPollOption = () => {
  poll.value.options.push("");
};

const startPoll = () => {
  poll.value.active = true;
  console.log("Poll started");
};

const endPoll = () => {
  poll.value.active = false;
  console.log("Poll ended");
};

const incrementCounter = (id: number) => {
  const counter = counters.value.find((c) => c.id === id);
  if (counter) counter.value++;
};

const decrementCounter = (id: number) => {
  const counter = counters.value.find((c) => c.id === id);
  if (counter && counter.value > 0) counter.value--;
};

const addCounter = () => {
  if (newCounter.value.name.trim()) {
    counters.value.push({
      id: Date.now(),
      name: newCounter.value.name,
      value: 0,
    });
    newCounter.value.name = "";
    showAddCounterDialog.value = false;
  }
};

const toggleTimer = (id: number) => {
  const timer = timers.value.find((t) => t.id === id);
  if (timer) {
    console.log(`Timer ${timer.name} ${timer.active ? "started" : "stopped"}`);
  }
};

const addTimer = () => {
  if (newTimer.value.name.trim() && newTimer.value.message.trim()) {
    timers.value.push({
      id: Date.now(),
      name: newTimer.value.name,
      message: newTimer.value.message,
      interval: newTimer.value.interval,
      active: false,
    });
    newTimer.value = {
      name: "",
      message: "",
      interval: 10,
    };
    showAddTimerDialog.value = false;
  }
};
</script>

<style lang="scss" scoped>
.v-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-chip {
  font-weight: 500;
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 4px;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.04);
  }
}
</style>
