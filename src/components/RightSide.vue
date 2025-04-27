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
  <div class="expanded column card" ref="card">
    <h3>Current Event Stack</h3>

    <TransitionGroup class="event-holder" name="list" tag="ul">
      <li v-for="(event, i) in props.events" :key="i">
        <EventDisplay :event />
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
}

.event-holder {
  height: 100%;
  list-style-type: none;
  list-style-position: inside;
  overflow-y: scroll;
  overflow-x: hidden;
}

.event-holder > li {
  padding-bottom: 1rem;
}

ul {
  padding: 0;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.1s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
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
