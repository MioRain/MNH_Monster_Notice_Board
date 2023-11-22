import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";

export const useUserDataStore = defineStore('user-data', () => {

  const {
    monsterList,
    filteredMonsterList,
  } = useEyewitnessInfoStore();


  const currentLatitude = ref(0)
  const currentLongitude = ref(0)
  const filterData = reactive({
    date: '',
    filteredNum: [],
    huntedNum: [],
    removedNum: [],
    round: 0,
    rare: 0,
    monsterName: '',
    distance: 0,
    isMap: false,
  })
  const openStreetMap = reactive({})
  const markersLayer = reactive({})

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          currentLatitude.value = position.coords.latitude
          currentLongitude.value = position.coords.longitude
          return resolve(position)
        },
        error => { reject('無法使用定位功能') }
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
    const expiredTime = now.subtract(1, 'days').hours(expiredHour).minutes(0).seconds(0).milliseconds(0).format()
    return { sheetName, expiredTime }
  }

  function getFilteredData(data) {
    return data
      .filter((item) => {
        if (filterData.isMap && (item.isHunted || item.isRemoved)) return true
        const condition1 = !filterData.filteredNum?.includes(item.serialNum);
        const condition2 = filterData.round ? filterData.round === item.round : true;
        const condition3 = filterData.rare ? filterData.rare >= item.rare : true;
        const condition4 = filterData.monsterName
          ? filterData.monsterName === item.monsterName
          : true;
        const condition5 =
          filterData.distance > 0
            ? Number(item.distance) < filterData.distance
            : Number(item.distance) > 0;
        const condition6 = !item.isHunted && !item.isRemoved;

        if (condition1 && condition2 && condition3 && condition4 && condition5 && condition6) return true;
      })
  }

  function addMarker() {
    if (monsterList.value?.length > 0) {
      markersLayer.value?.clearLayers();
      filterData.isMap = true
      const newArr = getFilteredData(monsterList.value)
      newArr.forEach((monster) => {
        const newMarker = L.marker([monster.lat, monster.lng], {
          icon: L.icon({
            iconUrl: monster.isHunted ? `/images/complete.png` : monster.isRemoved ? `/images/fail.png` : `/images/${monster.monsterName}.png`,
            iconSize: [50, 50],
          }),
          opacity: 1.0,
        })
          .bindPopup(`<b>編號：${monster.serialNum}`)
          .addTo(markersLayer.value);

        newMarker.on("click", function () {
          filteredMonsterList.value = [
            monsterList.value.find((target) => monster.serialNum === target.serialNum),
          ];
        });
      });
      filterData.isMap = false
    }
  }

  return { currentLatitude, currentLongitude, filterData, openStreetMap, markersLayer, getCurrentPosition, getSheetNameAndExpiredTime, getFilteredData, addMarker }
})