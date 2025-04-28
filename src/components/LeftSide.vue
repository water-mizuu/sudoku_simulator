<script setup lang="ts">
import ActionDisplay from "@/components/ActionDisplay.vue";
import type { LinkedList } from "@/linked_list";
import type { Action, StartingGrid } from "@/views/MainScreen.vue";
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  actions: LinkedList<Action>;
  actionCount: number;
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
  "Medium -- Benchmark": [
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
  "January 19th 'Diabolical'": [
    [0, 2, 0, 6, 0, 8, 0, 0, 0],
    [5, 8, 0, 0, 0, 9, 7, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 0],
    [3, 7, 0, 0, 0, 0, 5, 0, 0],
    [6, 0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 9, 8, 0, 0, 0, 3, 6],
    [0, 0, 0, 3, 0, 6, 0, 9, 0],
  ],
  "Vegard Hanssen Puzzle 2155141": [
    [0, 0, 0, 6, 0, 0, 4, 0, 0],
    [7, 0, 0, 0, 0, 3, 6, 0, 0],
    [0, 0, 0, 0, 9, 1, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 1, 8, 0, 0, 0, 3],
    [0, 0, 0, 3, 0, 6, 0, 4, 5],
    [0, 4, 0, 2, 0, 0, 0, 6, 0],
    [9, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 1, 0, 0],
  ],
  "Challenge 1 -- Logic": [
    [0, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 0, 0, 0, 0, 3],
    [0, 7, 4, 0, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0, 2],
    [0, 8, 0, 0, 4, 0, 0, 1, 0],
    [6, 0, 0, 5, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 7, 8, 0],
    [5, 0, 0, 0, 0, 9, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 4, 0],
  ],
  "Uunsolvable #2": [
    [0, 0, 0, 3, 0, 2, 0, 0, 0],
    [0, 5, 0, 7, 9, 8, 0, 3, 0],
    [0, 0, 7, 0, 0, 0, 8, 0, 0],
    [0, 0, 8, 6, 0, 7, 3, 0, 0],
    [0, 7, 0, 0, 0, 0, 0, 6, 0],
    [0, 0, 3, 5, 0, 4, 1, 0, 0],
    [0, 0, 5, 0, 0, 0, 6, 0, 0],
    [0, 2, 0, 4, 1, 9, 0, 5, 0],
    [0, 0, 0, 8, 0, 6, 0, 0, 0],
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

// watch(props.actions, () => {
//   displayedAction.value = props.actions.length - 1;
// });
</script>

<template>
  <div class="card">
    <h3>Current Action</h3>

    <ActionDisplay :action="props.actions.first" :action-count />
  </div>

  <div class="card column" style="height: unset; gap: 1rem">
    <h3>Starting Grid</h3>

    <select id="cars" name="cars" @change="onGridChange">
      <option v-for="[key, value] in Object.entries(grids)" :key="key" :value="key">
        {{ key }}
      </option>
    </select>
  </div>
</template>
