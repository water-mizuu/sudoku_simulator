<script setup lang="ts">
import Controls from "@/components/ControlPanel.vue";
import LeftSide from "@/components/LeftSide.vue";
import RightSide from "@/components/RightSide.vue";
import SudokuGrid from "@/components/SudokuGrid.vue";
import { LinkedList } from "@/linked_list";
import { wait as sleep, splitFilter } from "@/utils";
import { reactive, ref, watch } from "vue";

export type Superposition = number[];
export type StartingGrid = number[][];
export type Grid = Superposition[][];
export type Index = [y: number, x: number];
export type Removal = [Index, number][];
export type Event = {
  /// The index of the tile we're currently trying.
  index: Index;

  /// The value that was tried.
  value: number;

  /// The removals made (including the one on the chosen tile.)
  removal: Removal;

  /// The indices collapsed
  collapsedIndices: Index[];

  /// The number that has been tried.
  tried: number[];
};
export type Action =
  | {
      action: "collapse";
      index: Index;
      value: number;
      affected: [Index, number[]][];
    }
  | {
      action: "backtrack";
      index: Index;
      restored: [Index, number[]][];
    };
export type State =
  | "idle"
  | "running"
  | "continuing"
  | "paused"
  | "backtracking_once"
  | "continuing_once"
  | "done"
  | "resetting";

const ROW_COUNT = 9;
const COLUMN_COUNT = 9;
const startGrid = ref<StartingGrid>([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]);

// Initialize the grid
const gameGrid = reactive([] as Grid);

const actions = reactive(new LinkedList() as LinkedList<Action>);
const events = reactive([] as Event[]);

const actionCount = ref(0);
let clicks = 0;
let indices = [] as Index[];
let triedIndex = null as null | Index;
let triedValues = null as null | number[];
let runningState = null as null | "propagate_min" | "backtrack" | "done";
const delayMs = ref(100);
const state = ref("idle" as State);

/// Resets the grid according to the START constant.
const initGrid = () => {
  actionCount.value = 0;
  actions.clear();
  events.length = 0;
  gameGrid.length = 0;

  for (let y = 0; y < ROW_COUNT; ++y) {
    const row: Superposition[] = [];
    for (let x = 0; x < COLUMN_COUNT; ++x) {
      row.push([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }
    gameGrid.push(row);
  }

  for (let y = 0; y < ROW_COUNT; ++y) {
    for (let x = 0; x < COLUMN_COUNT; ++x) {
      if (startGrid.value[y][x] != 0) {
        onTap([y, x], startGrid.value[y][x], undefined, false, false);
      }
    }
  }

  for (let y = 0; y < ROW_COUNT; ++y) {
    for (let x = 0; x < COLUMN_COUNT; ++x) {
      if (gameGrid[y][x].length > 1) {
        indices.push([y, x]);
      }
    }
  }
};

const onTap = (
  chosenIndex: Index,
  chosen: number,
  tried?: number[],
  removeIndices = false,
  recordActions = true,
) => {
  const removals: [Index, number][] = [];
  const visitedSet = new Set<string>();
  const hasCollapsed: [Index, number][] = [[chosenIndex, chosen]];

  while (hasCollapsed.length > 0) {
    const [[y_, x_], chosen] = hasCollapsed.pop()!;
    if (visitedSet.has(`${y_},${x_}`)) {
      continue;
    }
    visitedSet.add(`${y_},${x_}`);

    // Update the chosen tile.
    const [removed, kept] = splitFilter(gameGrid[y_][x_], (n) => n != chosen);
    for (const number of removed) {
      removals.push([[y_, x_], number]);
    }
    gameGrid[y_][x_] = kept;

    // Update the 3x3 square.
    const squareY = ~~(y_ / 3) * 3;
    const squareX = ~~(x_ / 3) * 3;
    for (let y = squareY; y < squareY + 3; ++y) {
      for (let x = squareX; x < squareX + 3; ++x) {
        if (y == y_ || x == x_) continue;

        const [removed, kept] = splitFilter(gameGrid[y][x], (n) => n == chosen);
        for (const number of removed) {
          removals.push([[y, x], number]);
        }
        gameGrid[y][x] = kept;

        if (gameGrid[y][x].length == 1) {
          hasCollapsed.push([[y, x], gameGrid[y][x][0]]);
        }
      }
    }

    // Update the row.
    for (let x = 0; x < COLUMN_COUNT; ++x) {
      if (x == x_) continue;

      const [removed, kept] = splitFilter(gameGrid[y_][x], (n) => n == chosen);
      for (const number of removed) {
        removals.push([[y_, x], number]);
      }
      gameGrid[y_][x] = kept;

      if (gameGrid[y_][x].length == 1) {
        hasCollapsed.push([[y_, x], gameGrid[y_][x][0]]);
      }
    }

    // Update the column.
    for (let y = 0; y < ROW_COUNT; ++y) {
      if (y == y_) continue;

      const [removed, kept] = splitFilter(gameGrid[y][x_], (n) => n == chosen);
      for (const number of removed) {
        removals.push([[y, x_], number]);
      }
      gameGrid[y][x_] = kept;

      if (gameGrid[y][x_].length == 1) {
        hasCollapsed.push([[y, x_], gameGrid[y][x_][0]]);
      }
    }
  }

  /// Keep track of the indices in the current grid that have collapsed.
  const collapsedIndices: Index[] = [];
  for (const [[y, x]] of removals) {
    if (gameGrid[y][x].length == 1) {
      collapsedIndices.push([y, x]);
    }
  }

  if (tried != null) {
    events.push({
      index: chosenIndex,
      value: chosen,
      removal: Array.from(removals),
      collapsedIndices: collapsedIndices,
      tried: tried.concat(chosen),
    });
  }

  if (recordActions) {
    actionCount.value += 1;
    actions.add({
      action: "collapse",
      index: chosenIndex,
      value: chosen,
      affected: aggregateRemovals(removals),
    });
  }

  if (removeIndices) {
    for (const [y, x] of collapsedIndices) {
      indices = indices.filter(([cy, cx]) => !(cy == y && cx == x));
    }
  }

  return [collapsedIndices, removals] as const;
};

const aggregateRemovals = (removals: ReturnType<typeof onTap>[1]) => {
  const aggregated: [Index, number[]][] = [];
  for (const [[y, x], value] of removals) {
    let pair = aggregated.filter(([[cy, cx]]) => y == cy && x == cx)[0];
    if (pair == null) {
      pair = [[y, x], []];
      aggregated.push(pair);
    }

    pair[1].push(value);
  }

  return aggregated;
};

const onClickPauseOrPlay = async () => {
  console.log(state.value);
  clicks += 1;

  const v = state.value;
  if (v == "idle") {
    state.value = "running";
  } else if (v == "running") {
    state.value = "paused";
  } else if (v == "paused") {
    state.value = "running";
  } else if (v == "done") {
    state.value = "resetting";
  } else {
    throw new Error("Unknown " + v);
  }

  // if (isStarted.value) {
  //   isPaused.value = !isPaused.value;

  //   isContinueOnce.value = false;
  //   isBacktrackOnce.value = false;
  // } else if (isFinished.value) {
  //   isPaused.value = false;
  //   initGrid();
  //   isFinished.value = false;
  // } else {
  //   isStarted.value = true;
  //   isFinished.value = false;
  //   isPaused.value = false;
  //   events.length = 0;

  //   await onSolvePropagation();
  //   isFinished.value = true;
  //   isStarted.value = false;
  // }
};

const onBacktrack = () => {
  state.value = "backtracking_once";
};

const onStepForward = () => {
  state.value = "continuing_once";
};

const onSpeedChanged = (v: number) => {
  delayMs.value = Math.max(0, Math.min(1000, 100 + (v - 50) * 4));
};

const onGridChanged = (grid: StartingGrid) => {
  clicks += 1;
  runningState = null;
  indices = [];
  triedIndex = null;
  triedValues = null;
  runningState = null;

  state.value = "idle";
  startGrid.value = grid;

  initGrid();
};

initGrid();

const chooseBestIndex = () => {
  let bestIndex: Index = [-1, -1];
  let bestLength = Number.POSITIVE_INFINITY;
  for (const index of indices) {
    const [y, x] = index;
    if (gameGrid[y][x].length < bestLength) {
      bestIndex = index;
      bestLength = gameGrid[y][x].length;
    }
  }

  return bestIndex;
};

const propagate = () => {
  if (indices.length <= 0) {
    runningState = "done";
    return;
  }

  const index = triedIndex != null ? triedIndex : chooseBestIndex();

  const superpositions = gameGrid[index[0]][index[1]];
  const viable = superpositions.filter((n) => triedValues == null || !triedValues.includes(n));
  if (viable.length <= 0) {
    /// Perform a backtrack.
    runningState = "backtrack";
    return;
  }

  const chosen = viable[~~(Math.random() * viable.length)];

  /// We propagate the changes to the grid.
  onTap(index, chosen, triedValues ?? [], true);

  triedValues = null;
  triedIndex = null;
  return;
};

const backtrack = () => {
  if (events.length <= 0) {
    alert("This has no solution!");
    throw new Error("This has no solution!");
  }

  const { index, removal, collapsedIndices, tried } = events.pop()!;
  triedIndex = index;
  triedValues = tried;

  for (const [[y, x], n] of removal) {
    gameGrid[y][x].push(n);
  }

  for (const [y, x] of collapsedIndices) {
    indices.push([y, x]);
  }

  actionCount.value += 1;
  actions.add({
    action: "backtrack",
    index: index,
    restored: aggregateRemovals(removal),
  });

  runningState = "propagate_min";
};

watch(state, async (now) => {
  if (now == "continuing") {
    state.value = "running";
  } else if (now == "running") {
    const copy = clicks;

    switch (runningState) {
      case null:
        runningState = "propagate_min";

        break;
      case "propagate_min": {
        propagate();
        break;
      }
      case "backtrack": {
        backtrack();
        break;
      }
      case "done": {
        runningState = null;
        state.value = "done";
        break;
      }
    }

    if (state.value != "done") {
      await sleep(delayMs.value);
      if (copy == clicks) {
        state.value = "continuing";
      }
    }
  } else if (now == "resetting") {
    actionCount.value = 0;
    indices = [];
    triedIndex = null;
    triedValues = null;
    runningState = null;

    initGrid();

    state.value = "idle";
  } else if (now == "backtracking_once") {
    backtrack();

    state.value = "idle";
  } else if (now == "continuing_once") {
    console.log("Propagating");
    propagate();

    if (runningState == "backtrack") {
      backtrack();
    } else if (runningState == "done") {
      runningState = null;

      state.value = "done";
    }

    if (state.value != "done") {
      state.value = "idle";
    }
  } else {
    console.log({ now });
  }
});
</script>

<template>
  <div class="screen column">
    <div class="column-shrink">
      <p class="title">Sudoku Solver Visualization</p>
      <p>Wave Function Collapse with Backtracking</p>
    </div>
    <div class="expanded row main-body">
      <div class="expanded column side-bar">
        <LeftSide :actions :action-count @change-grid="onGridChanged" />
      </div>
      <div class="column expanded center-column">
        <div class="card sudoku-holder">
          <SudokuGrid :game-grid="gameGrid" :actions @tap="(i, n) => onTap(i, n, [], true)" />
        </div>
        <div class="card">
          <Controls
            :state="state"
            :is-backtrack-allowed="events.length > 0"
            @pause-play="onClickPauseOrPlay"
            @backtrack="onBacktrack"
            @step-forward="onStepForward"
            @speed-changed="onSpeedChanged"
          />
        </div>
        <div style="text-align: center">
          <p>Made by <b>water-mizuu</b>.</p>
          <p>
            Sample puzzles are taken from
            <a href="https://sandiway.arizona.edu/"> https://sandiway.arizona.edu/</a>
            .
          </p>
        </div>
      </div>
      <div class="expanded column side-bar">
        <RightSide :events />
      </div>
    </div>
  </div>
</template>

<style>
.card {
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid lightgrey;
}
</style>

<style scoped>
.sudoku-holder {
  display: flex;
  justify-content: center;
  align-items: center;
}

.screen {
  width: 100%;
  height: 100%;
  overflow-y: hidden;

  padding: 1rem;
}

.title {
  font-size: 32px;
  font-weight: 600;
  color: rgb(44, 92, 182);
}

.side-bar {
  gap: 1rem;
}

.main-body {
  padding: 2rem;
  gap: 1.5rem;
}

.center-column {
  gap: 1rem;
}

.column {
  display: flex;
  flex-direction: column;
}

.column > * {
  flex-shrink: 1;
}

.row {
  display: flex;
  flex-direction: row;
}

.row > * {
  flex-shrink: 1;
}

.expanded {
  flex: 1;
}

.flex-grow {
  flex-grow: 1;
}
.flex-shrink {
  flex-shrink: 1;
}
.h-100 {
  height: 100%;
}
</style>
