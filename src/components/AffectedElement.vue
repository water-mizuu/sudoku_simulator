<script setup lang="ts">
import type { Index } from "@/views/MainScreen.vue";

const props = defineProps<{
  index: Index;
  valuesRemoved: number[];
}>();

const [y, x] = props.index;
</script>
<template>
  <div class="row" style="width: 100%; justify-content: space-between">
    <b class="title">Cell R{{ y }}C{{ x }}</b>
    <div class="removed">
      <span v-for="n in props.valuesRemoved" :key="n" class="removed-value">
        {{ n }}
      </span>
    </div>
  </div>
</template>
<style lang="css" scoped>
.title {
  white-space: nowrap;
}

.removed {
  display: flex;
  gap: 0.5rem;
}

.removed-value {
  color: rgb(188, 44, 44);
  text-decoration: line-through;
}
</style>
