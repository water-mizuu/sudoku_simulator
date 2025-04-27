<script setup lang="ts">
import type { Action, Grid, Index } from "@/views/MainScreen.vue";
import { computed } from "vue";
import SudokuTile from "./SudokuTile.vue";

const props = defineProps<{
  gameGrid: Grid;
  actions: Action[];
}>();

const emits = defineEmits<{
  onTap: [index: Index, number: number];
}>();

const emitOnTap = (index: Index, number: number) => emits("onTap", index, number);

const lastAction = computed(() => props.actions[props.actions.length - 1]);
const highlightTuple = computed(() => {
  const action = lastAction.value;
  if (action == null) {
    return [[] as Index[], [] as Index[], [] as Index[], null];
  }

  const actionType = action.action;

  const yellow = [] as Index[];
  const red = [] as Index[];
  const blue = [] as Index[];
  let highlighted = null as Index | null;

  if (actionType == "backtrack") {
    red.push(action.index);
    for (const [index, _] of action.restored) {
      yellow.push(index);
    }
  } else {
    const [y_, x_] = (highlighted = action.index);

    /* highlight blue */ {
      // Add the 3x3 square.
      const squareY = ~~(y_ / 3) * 3;
      const squareX = ~~(x_ / 3) * 3;
      for (let y = squareY; y < squareY + 3; ++y) {
        for (let x = squareX; x < squareX + 3; ++x) {
          if (y == y_ || x == x_) continue;

          blue.push([y, x]);
        }
      }

      // Add the row.
      for (let x = 0; x < 9; ++x) {
        if (x == x_) continue;

        blue.push([y_, x]);
      }

      // Add the column
      for (let y = 0; y < 9; ++y) {
        if (y == y_) continue;

        blue.push([y, x_]);
      }
    }

    for (const [[y, x], _] of action.affected) {
      if (blue.some(([cy, cx]) => cy == y && cx == x)) continue;

      if (props.gameGrid[y][x].length <= 0) {
        red.push([y, x]);
      } else {
        yellow.push([y, x]);
      }
    }
  }

  return [yellow, red, blue, highlighted] as const;
});

const yellow = computed(() => highlightTuple.value[0]!);
const red = computed(() => highlightTuple.value[1]!);
const blue = computed(() => highlightTuple.value[2]!);
const highlighted = computed(() => highlightTuple.value[3]);

const highlights = computed(() => {
  const highlights: Map<`${number}-${number}`, ("red" | "yellow" | "blue" | "highlighted")[]> =
    new Map();

  for (let y = 0; y < props.gameGrid.length; ++y) {
    for (let x = 0; x < props.gameGrid[y].length; ++x) {
      const key = `${y}-${x}` as const;
      const props = [] as ("red" | "yellow" | "blue" | "highlighted")[];

      if (red.value.some(([cy, cx]) => cy == y && cx == x)) {
        props.push("red");
      }
      if (blue.value.some(([cy, cx]) => cy == y && cx == x)) {
        props.push("blue");
      }
      if (yellow.value.some(([cy, cx]) => cy == y && cx == x) && !props.includes("blue")) {
        props.push("yellow");
      }
      if (highlighted.value != null && highlighted.value[0] == y && highlighted.value[1] == x) {
        props.length = 0;
        props.push("highlighted");
      }

      if (props.length > 0) {
        highlights.set(key, props);
      }
    }
  }

  return highlights;
});

const addeds = computed(() => {
  const action = lastAction.value;
  const highlights: Map<`${number}-${number}`, number[]> = new Map();

  if (action == null) return highlights;

  if (action.action == "backtrack") {
    for (const [[y, x], nums] of action.restored) {
      highlights.set(`${y}-${x}`, nums);
    }
  }

  return highlights;
});

const removeds = computed(() => {
  const action = lastAction.value;
  const highlights: Map<`${number}-${number}`, number[]> = new Map();

  if (action == null) return highlights;

  if (action.action == "collapse") {
    for (const [[y, x], nums] of action.affected) {
      highlights.set(`${y}-${x}`, nums);
    }
  }

  return highlights;
});
</script>

<template>
  <div class="container">
    <template v-for="(row, y) in props.gameGrid">
      <div class="row">
        <SudokuTile
          v-for="(tile, x) in row"
          @on-tap="emitOnTap"
          :id="[y, x]"
          :key="`${y}-${x}`"
          :added="addeds.get(`${y}-${x}`)"
          :removed="removeds.get(`${y}-${x}`)"
          :highlights="highlights.get(`${y}-${x}`)"
          :state="tile.length == 0 ? 'empty' : tile.length == 1 ? 'collapsed' : 'uncollapsed'"
          :value="tile.length == 1 ? tile[0] : null"
          :available="tile.length > 1 ? tile : null"
          class="tile expanded"
        />

      </div>
    </template>
  </div>
</template>

<style lang="css" scoped>
.container {
  aspect-ratio: 1;
}

.row:first-child > .tile:first-child {
  border-radius: 4px 0px 0px 0px;
}
.row:first-child > .tile:last-child {
  border-radius: 0px 4px 0px 0px;
}

.row:last-child > .tile:last-child {
  border-radius: 0px 0px 4px 0px;
}

.row:last-child > .tile:first-child {
  border-radius: 0px 0px 0px 4px;
}

.row:first-child > .tile,
.row:nth-child(4) > .tile,
.row:nth-child(7) > .tile {
  border-top: 1px solid black;
}

.row:last-child > .tile {
  border-bottom: 1px solid black;
}

.tile:first-child {
  border-left: 1px solid black;
}

.tile:last-child,
.tile:nth-child(3),
.tile:nth-child(6) {
  border-right: 1px solid black;
}

.row:not(:nth-child(3), :nth-child(6), :last-child) > .tile {
  border-bottom: 1px solid #b5b5b5;
}

.tile:not(:nth-child(3), :nth-child(6), :last-child) {
  border-right: 1px solid #b5b5b5;
}
</style>
