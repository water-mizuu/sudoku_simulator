<script setup lang="ts">
import type { Event } from "@/views/MainScreen.vue";
import { onMounted, ref } from "vue";
import EventDisplay from "./EventDisplay.vue";

const props = defineProps<{
  events: Event[];
}>();

const card = ref<HTMLElement>();
const setHeightOfCard = () => {
  const cardElement = card.value;
  if (cardElement == null) return;

  cardElement.style.height = `${cardElement.offsetHeight}px`;
  cardElement.style.maxHeight = `${cardElement.offsetHeight}px`;
};

onMounted(() => {
  setHeightOfCard();
});
</script>

<template>
  <div class="parent expanded column card" ref="card">
    <h3>Current Placement Sequence</h3>
    <ul class="event-holder" name="list">
      <li v-for="(event, i) in props.events" :key="i">
        <EventDisplay :event :index="i + 1" :total-length="props.events.length" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.parent {
  gap: 1rem;
}

.event-holder {
  height: 100%;
  list-style-type: none;
  list-style-position: inside;
  overflow-y: auto;
  overflow-x: hidden;
}

.event-holder > li {
  padding-bottom: 1rem;
}

ul {
  padding: 0;
}

.container {
  padding: 0.5rem;
  background-color: rgb(227, 232, 255);
  border-radius: 4px;
}

.label {
  display: flex;
  flex-direction: column;
}
.title {
  color: rgb(55, 48, 163);
}
</style>
