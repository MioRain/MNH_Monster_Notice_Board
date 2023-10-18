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

  return { currentLatitude, currentLongitude, getCurrentPosition }
})