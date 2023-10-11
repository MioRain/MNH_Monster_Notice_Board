<script setup>
import MonsterCard from "./components/MonsterCard.vue";
import FeatureButton from "./components/FeatureButton.vue";
</script>

<template>
  <MonsterCard />
  <FeatureButton />
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

@media (min-width: 768px) {
  #app {
    width: 80vw;
    height: 90vh;
    margin: 5vh auto 5vh auto;
    border: 3px solid #c0b08e;
    border-radius: 30px;
  }
}
</style>
