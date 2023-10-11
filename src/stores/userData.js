import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserDataStore = defineStore('user-data', () => {
  const currentLatitude = ref(0)
  const currentLongitude = ref(0)

  function getCurrentPosition() {
    if ("geolocation" in navigator) {
      /* geolocation is available */
      function success(pos) {
        currentLatitude.value = pos.coords.latitude
        currentLongitude.value = pos.coords.longitude
  
        console.log(`Your current position is: ${currentLatitude.value}, ${currentLongitude.value}`)
      }
  
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }
      
      navigator.geolocation.getCurrentPosition(success, error);
      
    } else {
      /* geolocation IS NOT available */
      alert("Sorry, geolocation IS NOT available.");
    }
  }

  return { currentLatitude, currentLongitude, getCurrentPosition }
})