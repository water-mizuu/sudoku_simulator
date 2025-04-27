<script setup lang="ts">
import type { State } from "@/views/MainScreen.vue";

const props = defineProps<{
  state: State;

  isBacktrackAllowed: boolean;
}>();

const emit = defineEmits<{
  pausePlay: [];
  backtrack: [];
  stepForward: [];
  speedChanged: [value: number];
}>();
</script>

<template>
  <div class="row main-controls">
    <div class="expanded row buttons">
      <button class="play" @click="emit('pausePlay')">
        <span class="icon">send</span>
        {{
  state == "paused"
    ? "Resume"
    : state == "idle"
      ? "Start"
      : state == "done"
        ? "Reset"
        : state == "running"
          ? "Pause"
          : (() => {
            console.log(state);
            return "UNKNOWN";
          }) ()
        }}
      </button>
      <button @click="emit('backtrack')" :disabled="!props.isBacktrackAllowed">Backtrack</button>
      <button @click="emit('stepForward')">Step Forward</button>
    </div>
    <div class="column-shrink">
      <input
        min="1"
        max="100"
        type="range"
        class="slider"
        @change="(e) => emit('speedChanged', Number((e.target as HTMLInputElement).value))"
      />
      <p style="text-align: center">Step delay</p>
    </div>
  </div>
</template>

<style scoped>
.main-controls {
  gap: 2rem;
  justify-content: space-around;
}

.icon {
  font-family: "Material Icons";
  font-size: 14px;
}

.slider {
  flex: 4;
}

.buttons {
  justify-content: space-between;
  flex: 5;
}

button {
  padding: 8px;
  border-radius: 9999px;
  border: 1px solid lightgrey;
}

button.play {
  color: white;
  background-color: cornflowerblue;
  text-align: center;
  vertical-align: middle;
}
</style>
