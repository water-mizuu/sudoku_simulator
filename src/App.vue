<script setup lang="ts">
import MainScreen from "./views/MainScreen.vue";
</script>

<template>
  <div class="wrapper">
    <MainScreen class="game-tile" />
  </div>
</template>

<style scoped>
.wrapper {
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;

  overflow-x: hidden;
}
</style>
