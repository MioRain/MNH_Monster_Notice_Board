import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useUserDataStore = defineStore('user-data', () => {
  const currentLatitude = ref(0)
  const currentLongitude = ref(0)
  const filterData = reactive({
    date: '',
    huntedNum: [],
    round: 0,
    rare: 0,
    monsterName: '',
    distance: 30
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
    let res = hour - ((hour + 1) % 3)
    if (res < 0) {
      res += 24
    }
    return res
  }

  function getSheetNameAndExpiredTime(isPark) {
    const now = moment()
    const sheetName = now.hour() === 23 ? now.add(1, 'days').format('YYYY/M/D') : now.format('YYYY/M/D')
    const expiredHour = isPark ? now.hour() + 1 : getStartHour(now.hour() + 3)
    const expiredTime = now.hours(expiredHour).minutes(0).seconds(0).milliseconds(0).format()
    return { sheetName, expiredTime }
  }

  function getFilteredData(data) {
    return data
      .filter((item) => {
        const condition1 = !filterData.huntedNum?.includes(item.serialNum);
        const condition2 = filterData.round ? filterData.round === item.round : true;
        const condition3 = filterData.rare ? filterData.rare === item.rare : true;
        const condition4 = filterData.monsterName
          ? filterData.monsterName === item.monsterName
          : true;
        const condition5 =
          filterData.distance > 0
            ? Number(item.distance) < filterData.distance
            : Number(item.distance) > 0;

        if (condition1 && condition2 && condition3 && condition4 && condition5)
          return true;
      })
  }
  return { currentLatitude, currentLongitude, filterData, getCurrentPosition, getSheetNameAndExpiredTime, getFilteredData }
})