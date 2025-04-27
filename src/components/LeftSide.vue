<script setup lang="ts">
import ActionDisplay from "@/components/ActionDisplay.vue";
import type { Action, StartingGrid } from "@/views/MainScreen.vue";
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  actions: Action[];
}>();

const emits = defineEmits<{
  changeGrid: [grid: StartingGrid];
}>();

const grids: Record<string, StartingGrid> = {
  Blank: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  Difficult: [
    [0, 0, 3, 0, 0, 0, 0, 0, 9],
    [0, 8, 0, 2, 0, 0, 6, 3, 0],
    [0, 0, 0, 0, 0, 6, 0, 0, 4],
    [0, 4, 0, 0, 5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 9, 0],
    [0, 0, 5, 0, 0, 7, 3, 2, 0],
    [1, 0, 0, 8, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 6],
    [0, 0, 4, 0, 0, 2, 7, 5, 0],
  ],
};

const displayedAction = ref(0);

const onGridChange = (event: Event) => {
  const chosenValue = (event.target as HTMLSelectElement)?.value;
  if (chosenValue == null) return;

  const chosenGrid = grids[chosenValue];
  if (chosenGrid == null) return;

  emits("changeGrid", chosenGrid);
};

onMounted(() => {
  emits("changeGrid", grids["Blank"]);
});

watch(props.actions, () => {
  displayedAction.value = props.actions.length - 1;
});
</script>

<template>
  <div class="card">
    <h3>Current Action</h3>

    <ActionDisplay :action="props.actions[displayedAction]" />
  </div>

  <div class="card">
    <h3>Starting Grid</h3>

    <select id="cars" name="cars"  @change="onGridChange">
      <option v-for="[key, value] in Object.entries(grids)" :key="key" :value="key">
        {{ key }}
      </option>
    </select>
  </div>
</template>
