<script setup lang="ts">
import type { Action } from "@/views/MainScreen.vue";
import { computed } from "vue";

const props = defineProps<{
  action: Action | undefined;
}>();

const action = computed(() => props.action);
</script>

<template>
  <template v-if="action == undefined"></template>
  <template v-else-if="action.action == 'collapse'">
    <div class="container-blue">
      <p class="title">Collapse {{ action.index }} with {{ action.value }}</p>
    </div>
  </template>
  <template v-else-if="action.action == 'backtrack'">
    <div class="container-red">
      <p class="title">Backtrack at {{ action.index }}</p>
    </div>
  </template>
</template>

<style scoped>
.container-blue {
  padding: 0.5rem;
  background-color: rgb(227, 232, 255);
  border-radius: 4px;
}

.container-blue .title {
  color: rgb(55, 48, 163);
}
.container-red {
  padding: 0.5rem;
  background-color: rgb(255, 227, 227);
  border-radius: 4px;
}

.container-red .title {
  color: rgb(163, 48, 48);
}

.label {
  display: flex;
  flex-direction: column;
}
</style>
