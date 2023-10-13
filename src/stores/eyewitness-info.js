import { reactive } from "vue";
import { defineStore } from "pinia"

export const useEyewitnessInfoStore = defineStore('eyewitness-info', () => {
  const eyewitnessInfo = reactive({
    time: 0,
    cityName: "",
    monsterName: "",
    round: 0,
    rare: 0,
    latitude: 0,
    longitude: 0,
    mapLink: "",
  });

  return { eyewitnessInfo }
})