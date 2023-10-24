<script setup>
import { storeToRefs } from "pinia";
import MonsterCard from "./components/MonsterCard.vue";
import FeatureButton from "./components/FeatureButton.vue";
import { useStateStore } from "@/stores/state";

const stateStore = useStateStore();

const { loadingStyle } = storeToRefs(stateStore);
</script>

<template>
  <div v-show="loadingStyle" class="loader">
    <div class="loading-text">L o a d i n g . . .</div>
  </div>
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

.loader {
  width: 100vw;
  height: 100vh;
  position: fixed;
  background-color: #d1cccc80;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select:none;
}

.loading-text {
  font-size: 32px;
  font-weight: bold;
  color: #2f9ee8;
  animation: fade-in 2s linear infinite;
  opacity: 0;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@media (min-width: 768px) {
  #app {
    width: 80vw;
    height: 90vh;
    margin: 5vh auto 5vh auto;
    border: 3px solid #c0b08e;
    border-radius: 30px;
  }

  .loader {
    margin: -5.5vh;
  }
}
</style>
