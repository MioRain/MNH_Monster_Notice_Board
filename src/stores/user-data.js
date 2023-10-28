import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserDataStore = defineStore('user-data', () => {
  const currentLatitude = ref(0)
  const currentLongitude = ref(0)

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          currentLatitude.value = position.coords.latitude
          currentLongitude.value = position.coords.longitude
          return resolve(position)
        },
        error => {
          console.warn(`ERROR(${err.code}): ${err.message}`)
          return reject(error)
        }
      )
    })
  }

  function getSheetName(hour) {
    let res = hour - ((hour + 1) % 3);
    if (res < 0) {
      res += 24;
    }
    return res;
  }

  function getTodayData() {
    const today = new Date();
    const todayData = {
      year: String(today.getFullYear()),
      month: String(today.getMonth() + 1).padStart(2, "0"),
      date: String(today.getDate()).padStart(2, "0"),
      hour: String(today.getHours()).padStart(2, "0"),
      minute: String(today.getMinutes()).padStart(2, "0"),
    };
    return todayData;
  }

  return { currentLatitude, currentLongitude, getCurrentPosition, getSheetName, getTodayData }
})