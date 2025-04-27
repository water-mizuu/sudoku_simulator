<script setup lang="ts">
import type { Index } from "@/views/MainScreen.vue";

type DiscriminatedProps = {
  id: Index;
  highlights: ("red" | "yellow" | "blue" | "highlighted")[] | undefined;
  added: number[] | undefined;
  removed: number[] | undefined;
} & (
  | {
      state: "uncollapsed";
      available: number[];
    }
  | {
      state: "collapsed";
      value: number;
    }
  | {
      state: "empty";
    }
);

/// Represents a single tile in a Sudoku puzzle.
///  A sudoku puzzle usually contains 9 by 9 of these tiles.
const props = defineProps<{
  id: Index;
  highlights: ("red" | "yellow" | "blue" | "highlighted")[] | undefined;
  added: number[] | undefined;
  removed: number[] | undefined;
  state: "empty" | "uncollapsed" | "collapsed";
  available: number[] | null;
  value: number | null;
}>();

const emits = defineEmits<{
  onTap: [id: Index, chosen: number];
}>();
</script>

<template>
  <div
    v-if="props.state == 'collapsed'"
    class="collapsed container"
    :class="{
      yellow: props.highlights?.includes('yellow'),
      red: props.highlights?.includes('red'),
      blue: props.highlights?.includes('blue'),
      highlighted: props.highlights?.includes('highlighted'),
    }"
  >
    <p style="aspect-ratio: 1">
      {{ props.value }}
    </p>
  </div>
  <div
    v-else-if="props.state == 'uncollapsed'"
    class="uncollapsed container"
    :class="{
      yellow: props.highlights?.includes('yellow'),
      red: props.highlights?.includes('red'),
      blue: props.highlights?.includes('blue'),
      highlighted: props.highlights?.includes('highlighted'),
    }"
  >
    <template v-for="n in 9" :key="`available-${n}`">
      <div
        @click="props.available?.includes(n) ? emits('onTap', id, n) : null"
        class="clickable"
        :class="{
          invisible: !props.available?.includes(n),
          added: props.added != null && props.added.some((s) => s == n),
          removed: props.removed != null && props.removed.some((s) => s == n),
        }"
      >
        {{ n }}
      </div>
    </template>
  </div>
  <div
    v-else
    class="container"
    :class="{
      yellow: props.highlights?.includes('yellow'),
      red: props.highlights?.includes('red'),
      blue: props.highlights?.includes('blue'),
      highlighted: props.highlights?.includes('highlighted'),
    }"
  >
    &nbsp;
  </div>
</template>

<style scoped>
.container {
  /* border: 1px solid rgb(173, 173, 173); */
  display: grid;

  /* I gave up */
  width: 4rem;
  height: 4rem;
}

.collapsed.container {
  display: flex;
  place-content: center;
  place-items: center;
  font-size: 1.75rem;
}

.uncollapsed.container {
  grid-template-columns: repeat(3, auto);
  grid-template-rows: repeat(3, auto);
}

.clickable {
  cursor: pointer;
  text-align: center;
}

.invisible {
  color: transparent;
  user-select: none;
  cursor: default;
}

.added {
  color: green;
  text-decoration: underline;
  user-select: none;
  cursor: default;
}

.removed {
  color: red;
  text-decoration: line-through;
  user-select: none;
  cursor: default;
}

.yellow {
  background-color: rgb(251, 255, 227);
}
.red {
  background-color: rgb(255, 227, 227);
}
.blue {
  background-color: rgb(233, 227, 255);
}
.highlighted {
  color: white;
  background-color: rgb(97, 73, 255);
}
</style>
