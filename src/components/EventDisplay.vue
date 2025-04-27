<script setup lang="ts">
import type { Event, Index } from "@/views/MainScreen.vue";
import { computed } from "vue";

const props = defineProps<{
  index: number;
  totalLength: number;
  event: Event;
}>();

const [y, x] = props.event.index;
const indexDisplay = `R${y}C${x}`;

const groups = new Map<string, [Index, number[]]>();
for (const [[y, x], number] of props.event.removal) {
  const key = `${y}-${x}`;

  if (!groups.has(key)) {
    groups.set(key, [[y, x], []]);
  }
  groups.get(key)![1].push(number);
}

const tried = props.event.tried;
</script>

<template>
  <div class="container row">
    <div class="expanded label">
      <p class="title">Placing {{ props.event.value }} at {{indexDisplay}}</p>
      <p>Collapsed cells: {{ groups.size }}</p>
      <p>Tried values: {{ tried }}</p>
    </div>

    <div class="count">{{ props.index }}/ {{ props.totalLength }}</div>
  </div>
</template>

<style scoped>
.container {
  padding: 0.5rem;
  background-color: rgb(227, 232, 255);
  border-radius: 4px;
}

.label {
  display: flex;
  flex-direction: column;
}
.title {
  color: rgb(55, 48, 163);
}
</style>
