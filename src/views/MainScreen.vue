<script setup lang="ts">
import Controls from "@/components/Controls.vue";
import LeftSide from "@/components/LeftSide.vue";
import RightSide from "@/components/RightSide.vue";
import SudokuGrid from "@/components/SudokuGrid.vue";
import { reactive, ref } from "vue";

export type Superposition = number[];
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

const ROW_COUNT = 9;
const COLUMN_COUNT = 9;
const START = [
  [0, 0, 3, 0, 0, 0, 0, 0, 9],
  [0, 8, 0, 2, 0, 0, 6, 3, 0],
  [0, 0, 0, 0, 0, 6, 0, 0, 4],
  [0, 4, 0, 0, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 9, 0],
  [0, 0, 5, 0, 0, 7, 3, 2, 0],
  [1, 0, 0, 8, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 6],
  [0, 0, 4, 0, 0, 2, 7, 5, 0],
];

// Initialize the grid
const gameGrid = reactive([] as Grid);

const actions = reactive([] as Action[]);
const events = reactive([] as Event[]);

const delayMs = ref(100);
const isStarted = ref(false);
const isPaused = ref(true);
const isFinished = ref(false);
const isContinueOnce = ref(false);
const isBacktrackOnce = ref(false);
let stopRunning = false;

/// Resets the grid according to the START constant.
const initGrid = () => {
  actions.length = 0;
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
      if (START[y][x] != 0) {
        onTap([y, x], START[y][x]);
      }
    }
  }
};

/// Splits an array into two arrays based on the predicate.
const splitFilter = <T,>(arr: T[], predicate: (n: T) => boolean) => {
  const a = [];
  const b = [];
  for (const n of arr) {
    if (predicate(n)) {
      a.push(n);
    } else {
      b.push(n);
    }
  }
  return [a, b] as [match: T[], reject: T[]];
};

const onTap = (chosenIndex: Index, chosen: number) => {
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

  return removals;
};

const aggregateRemovals = (removals: ReturnType<typeof onTap>) => {
  const aggregated: [Index, number[]][] = [];
  for (const [[y, x], value] of removals) {
    let pair = aggregated.filter(([[cy, cx], _]) => y == cy && x == cx)[0];
    if (pair == null) {
      pair = [[y, x], []];
      aggregated.push(pair);
    }

    pair[1].push(value);
  }

  return aggregated;
};

const onClickPauseOrPlay = async () => {
  if (isStarted.value) {
    isPaused.value = !isPaused.value;

    isContinueOnce.value = false;
    isBacktrackOnce.value = false;
  } else if (isFinished.value) {
    isPaused.value = false;
    initGrid();
    isFinished.value = false;
  } else {
    isStarted.value = true;
    isFinished.value = false;
    isPaused.value = false;
    events.length = 0;

    await onSolvePropagation();
    isFinished.value = true;
    isStarted.value = false;
  }
};

const onBacktrack = () => {
  isBacktrackOnce.value = true;
};

const onStepForward = () => {
  isContinueOnce.value = true;
};

const onSolvePropagation = async () => {
  let indices = [] as Index[];

  const chooseBestIndex = () => {
    let bestIndex = [-1, -1] as [number, number];
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

  for (let y = 0; y < ROW_COUNT; ++y) {
    for (let x = 0; x < COLUMN_COUNT; ++x) {
      if (gameGrid[y][x].length > 1) {
        indices.push([y, x]);
      }
    }
  }
  indices.sort(([y1, x1], [y2, x2]) => gameGrid[y1][x1].length - gameGrid[y2][x2].length);

  let tried = [] as number[];
  let tryingIndex = [-1, -1] as [number, number];

  outer: while (true) {
    /// We want to ignore the value of [isPaused] when
    ///   isContinueOnce is raised.
    if (!(isContinueOnce.value || isBacktrackOnce.value)) {
      if (isPaused.value) {
        await new Promise((r) => setTimeout(r, 10));

        continue;
      }
    }

    if (stopRunning) {
      stopRunning = false;
      initGrid();
      break outer;
    }

    let backtrack = true;

    if (!isBacktrackOnce.value) {
      do {
        if (indices.length <= 0) {
          break outer;
        }

        const index =
          tryingIndex[0] != -1 && tryingIndex[1] != -1 //
            ? tryingIndex
            : chooseBestIndex();

        const superpositions = gameGrid[index[0]][index[1]];
        const viable = superpositions.filter((n) => !tried.includes(n));
        if (viable.length <= 0) {
          /// Perform a backtrack.
          break;
        }

        const chosen = viable[~~(Math.random() * viable.length)];

        /// We propagate the changes to the grid.
        const propagations = onTap(index, chosen);

        /// Keep track of the indices in the current grid that have collapsed.
        const collapsedIndices: Index[] = [];
        for (const [[y, x], _] of propagations) {
          if (gameGrid[y][x].length == 1) {
            collapsedIndices.push([y, x]);
          }
        }

        /// We remove the collased indices.
        for (const [y, x] of collapsedIndices) {
          indices = indices.filter(([cy, cx]) => !(cy == y && cx == x));
        }

        events.push({
          index,
          value: chosen,
          removal: Array.from(propagations),
          collapsedIndices: collapsedIndices,
          tried: tried.concat(chosen),
        });

        actions.push({
          action: "collapse",
          index: index,
          value: chosen,
          affected: aggregateRemovals(propagations),
        });

        tried = [];
        tryingIndex = [-1, -1];

        backtrack = false;
      } while (false);
    }

    isContinueOnce.value = false;
    isBacktrackOnce.value = false;

    if (backtrack) {
      if (events.length <= 0) {
        throw new Error("This has no solution!");
      }

      const { index, removal, collapsedIndices, tried: previousTried } = events.pop()!;
      tryingIndex = index;
      tried = previousTried;

      for (const [[y, x], n] of removal) {
        gameGrid[y][x].push(n);
      }

      for (const [y, x] of collapsedIndices) {
        indices.push([y, x]);
      }

      actions.push({
        action: "backtrack",
        index: index,
        restored: aggregateRemovals(removal),
      });
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs.value));
  }

  isPaused.value = true;
};

const onSpeedChanged = (v: number) => {
  delayMs.value = Math.max(0, Math.min(1000, 100 + (v - 50) * 4));
};

initGrid();
</script>

<template>
  <div class="screen column">
    <div class="column flex-shrink">
      <p class="title">Sudoku Solver Visualization</p>
      <p>Wave Function Collapse with Backtracking</p>
    </div>
    <div class="expanded row main-body">
      <div class="expanded column side-bar">
        <LeftSide :actions />
      </div>
      <div class="column expanded center-column">
        <div class="card">
          <SudokuGrid :game-grid="gameGrid" :actions @on-tap="onTap" />
        </div>
        <div class="card">
          <Controls
            :is-started
            :is-paused
            :is-finished
            :is-backtrack-allowed="events.length > 1"
            @pause-play="onClickPauseOrPlay"
            @backtrack="onBacktrack"
            @step-forward="onStepForward"
            @speed-changed="onSpeedChanged"
          />
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
