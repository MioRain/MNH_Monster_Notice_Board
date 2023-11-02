import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useUserDataStore = defineStore('user-data', () => {
  const currentLatitude = ref(0)
  const currentLongitude = ref(0)
  const huntedList = reactive({
    startHour: '',
    huntedNum: []
  })

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

  function getStartHour(hour) {
    let res = hour - ((hour + 1) % 3);
    if (res < 0) {
      res += 24;
    }
    return res;
  }

  function getSheetNameAndExpiredTime(isPark) {
    const now = moment()
    const sheetName = now.format('YYYY/M/D')
    const expiredHour = isPark ? now.hour() + 1 : getStartHour(now.hour() + 3)
    const expiredTime = now.hours(expiredHour).minutes(0).seconds(0).milliseconds(0).format()
    return { sheetName, expiredTime }
  }

  return { currentLatitude, currentLongitude, huntedList, getCurrentPosition, getStartHour, getSheetNameAndExpiredTime }
})