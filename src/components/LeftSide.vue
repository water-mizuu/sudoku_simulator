<script setup lang="ts">
import ActionDisplay from "@/components/ActionDisplay.vue";
import type { Action } from "@/views/MainScreen.vue";
import { ref, watch } from "vue";

const props = defineProps<{
  actions: Action[];
}>();

const displayedAction = ref(0);

watch(props.actions, () => {
  displayedAction.value = props.actions.length - 1;
});
</script>

<template>
  <div class="card">
    <h3>Current Action</h3>

    <ActionDisplay :action="props.actions[displayedAction]" />
  </div>
</template>
