<script setup lang="ts">
import type { Action, Grid, Index } from "@/views/MainScreen.vue";
import { computed } from "vue";
import SudokuTile from "./SudokuTile.vue";

const props = defineProps<{
  gameGrid: Grid;
  actions: Action[];
}>();

const emits = defineEmits<{
  tap: [index: Index, number: number];
}>();

const emitOnTap = (index: Index, number: number) => emits("tap", index, number);

const lastAction = computed(() => props.actions[props.actions.length - 1]);
const highlightTuple = computed(() => {
  const action = lastAction.value;
  if (action == null) {
    return [[] as Index[], [] as Index[], [] as Index[], null] as const;
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

const highlights = computed(() => {
  const [yellow, red, blue, highlighted] = highlightTuple.value;

  const highlights: Map<`${number}-${number}`, ("red" | "yellow" | "blue" | "highlighted")[]> =
    new Map();

  for (let y = 0; y < props.gameGrid.length; ++y) {
    for (let x = 0; x < props.gameGrid[y].length; ++x) {
      const key = `${y}-${x}` as const;
      const props = [] as ("red" | "yellow" | "blue" | "highlighted")[];

      if (red.some(([cy, cx]) => cy == y && cx == x)) {
        props.push("red");
      }
      if (blue.some(([cy, cx]) => cy == y && cx == x)) {
        props.push("blue");
      }
      if (yellow.some(([cy, cx]) => cy == y && cx == x) && !props.includes("blue")) {
        props.push("yellow");
      }
      if (highlighted != null && highlighted[0] == y && highlighted[1] == x) {
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
    <template v-for="(row, y) in props.gameGrid" :key="y">
      <div class="row grid-row">
        <div class="left-label" :class="{ shifted: y == 0 }">R{{ y }}</div>
        <div v-for="(tile, x) in row" :key="`${y}-${x}`" class="row">
          <div v-if="y == 0" class="column-shrink tile-holder">
            <div class="top-label">C{{ x }}</div>
            <SudokuTile
              @tap="emitOnTap"
              :id="[y, x]"
              :added="addeds.get(`${y}-${x}`)"
              :removed="removeds.get(`${y}-${x}`)"
              :highlights="highlights.get(`${y}-${x}`)"
              :state="tile.length == 0 ? 'empty' : tile.length == 1 ? 'collapsed' : 'uncollapsed'"
              :value="tile.length == 1 ? tile[0] : null"
              :available="tile.length > 1 ? tile : null"
              class="tile expanded"
              :class="{
                [`tile${y}-${x}`]: true,
                [`row-${y}`]: true,
                [`column-${x}`]: true,
              }"
            />
          </div>
          <SudokuTile
            v-else
            @tap="emitOnTap"
            :id="[y, x]"
            :added="addeds.get(`${y}-${x}`)"
            :removed="removeds.get(`${y}-${x}`)"
            :highlights="highlights.get(`${y}-${x}`)"
            :state="tile.length == 0 ? 'empty' : tile.length == 1 ? 'collapsed' : 'uncollapsed'"
            :value="tile.length == 1 ? tile[0] : null"
            :available="tile.length > 1 ? tile : null"
            class="tile expanded"
            :class="{
              [`tile${y}-${x}`]: true,
              [`row-${y}`]: true,
              [`column-${x}`]: true,
            }"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="css" scoped>
.container {
  aspect-ratio: 1;
}

.left-label {
  padding-right: 8px;
}

.top-label {
  padding-bottom: 8px;
}

.grid-row {
  align-items: center;
}

.tile-holder {
  align-items: center;
}

.shifted {
  position: relative;
  top: 12px;
}

.tile0-0 {
  border-radius: 4px 0px 0px 0px;
}

.tile0-8 {
  border-radius: 0px 4px 0px 0px;
}

.tile8-8 {
  border-radius: 0px 0px 4px 0px;
}

.tile8-0 {
  border-radius: 0px 0px 0px 4px;
}

.column-0 {
  border-left: 1px black solid
}

.column-2, .column-5, .column-8 {
  border-right: 1px black solid;
}

.column-0, .column-1, .column-3, .column-4, .column-6, .column-7 {
  border-right: 1px grey solid;
}

.row-0 {
  border-top: 1px black solid;
}

.row-2, .row-5, .row-8 {
  border-bottom: 1px black solid;
}


.row-0, .row-1, .row-3, .row-4, .row-6, .row-7 {
  border-bottom: 1px grey solid;
}

</style>
