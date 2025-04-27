<script setup lang="ts">
import type { Event, Index } from "@/views/MainScreen.vue";

const props = defineProps<{
  event: Event;
}>();

const [y, x] = props.event.index;

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
  <div class="container">
    <div class="label">
      <p class="title">Placing {{ props.event.value }} at ({{ y }}, {{ x }})</p>
      <p>Collapsed cells: {{ groups.size }}</p>
      <p>Tried values: {{ tried }}</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 0.5rem;
  background-color: rgb(227, 232, 255);
  border-radius: 4px;
  overflow-y: scroll;
}

.label {
  display: flex;
  flex-direction: column;
}
.title {
  color: rgb(55, 48, 163);
}
</style>
