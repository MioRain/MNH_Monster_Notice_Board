<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/user-data";
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";
import { useStateStore } from "@/stores/state";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";
import L from "leaflet";

const userDataStore = useUserDataStore();
const stateStore = useStateStore();
const {
  getCurrentPosition,
  getSheetNameAndExpiredTime,
  getFilteredData,
  filterData,
  markersLayer,
} = useUserDataStore();
const { currentLatitude, currentLongitude } = storeToRefs(userDataStore);
const { loadingStyle, filterMode, showMap } = storeToRefs(stateStore);
const {
  eyewitnessInfo,
  monsterList,
  filteredMonsterList,
  getDistance,
} = useEyewitnessInfoStore();

const rareMonsterList = ["櫻火龍", "黑角龍"];
const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycbx1moX8y72JlTvKWSVe7U6-CsPyxOItMiH5JcJdokp2bUK3DTkseCt6wmBIf0SpW7i46g/exec";

const handleSubmit = async () => {
  try {
    const date = moment().format("YYYY/M/D");
    if (
      eyewitnessInfo.round > 6 ||
      eyewitnessInfo.round < 1 ||
      eyewitnessInfo.rare > 10 ||
      eyewitnessInfo.rare < 5 ||
      !rareMonsterList.includes(eyewitnessInfo.monsterName)
    ) {
      alert("周目(1~6)或星數(5~10)超過範圍，或尚未選擇目擊魔物");
      return;
    } else if (
      confirm(`
        請確認以下情報是否正確？
        目擊地區為： ${eyewitnessInfo.isPark ? "公園地區" : "一般地區"}
        目擊魔物為： ${eyewitnessInfo.monsterName}
        周目為： ${eyewitnessInfo.round}
        星數為： ${eyewitnessInfo.rare}
        `)
    ) {
      const { sheetName, expiredTime } = getSheetNameAndExpiredTime(
        eyewitnessInfo.isPark
      );
      const now = moment();

      loadingStyle.value = true;
      await getCurrentPosition();

      const payload = {
        sheetName,
        time: now.format(),
        expiredTime,
        isPark: eyewitnessInfo.isPark,
        monsterName: eyewitnessInfo.monsterName,
        round: eyewitnessInfo.round,
        rare: eyewitnessInfo.rare,
        latitude: currentLatitude.value,
        longitude: currentLongitude.value,
        mapLink: `https://www.google.com/maps/place/${currentLatitude.value},${currentLongitude.value}`,
      };

      const res = await axios.post(googleScriptUrl, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (filterData.date === date) {
        filterData.filteredNum.push(res.data);
      } else {
        filterData.date = date;
        filterData.filteredNum = [res.data];
      }

      localStorage.setItem("filterData", JSON.stringify(filterData));
      localStorage.setItem("submitedData", JSON.stringify(payload));
      eyewitnessInfo.isPark = false;
      loadingStyle.value = false;
      alert("發布成功");
    } else {
      return;
    }
  } catch (error) {
    console.error(error);
    alert(`
    發布失敗，請向開發者回報以下錯誤訊息
    ${error}
    `);
    loadingStyle.value = false;
  }
};

const handelFilter = () => {
  if (monsterList.value.length) {
    filteredMonsterList.value = getFilteredData(monsterList.value).sort(
      (a, b) => a.distance - b.distance
    );
  }
  mapSwitch();
  localStorage.setItem("filterData", JSON.stringify(filterData));
};

const fetchMonsterList = async () => {
  try {
    const now = encodeURIComponent(moment().format());
    const { sheetName } = getSheetNameAndExpiredTime(eyewitnessInfo.isPark);

    loadingStyle.value = true;

    const res = await axios.get(googleScriptUrl + `?sheetName=${sheetName}&now=${now}`);
    await getCurrentPosition();

    monsterList.value = res.data.map((data) => {
      const distance = getDistance(
        currentLatitude.value,
        currentLongitude.value,
        data[7],
        data[8],
        "K"
      );

      const likeRatio = Math.floor(
        (Number(data[10]) / (Number(data[10]) + Number(data[11]))) * 100
      );

      const monsterInfo = {
        serialNum: data[0],
        submitedTime: data[1],
        expiredTime: data[2],
        isPark: data[3],
        monsterName: data[4],
        round: data[5],
        rare: data[6],
        lat: data[7],
        lng: data[8],
        mapLink: data[9],
        distance: Number.parseFloat(distance).toFixed(3),
        likeRatio: likeRatio ? `${likeRatio}%` : "",
      };

      return monsterInfo;
    });

    filteredMonsterList.value = getFilteredData(monsterList.value).sort(
      (a, b) => a.distance - b.distance
    );

    if (!filteredMonsterList.value.length) alert("沒有符合篩選條件的情報");

    mapSwitch();

    loadingStyle.value = false;
  } catch (error) {
    console.error(error);
    monsterList.value = [];
    alert("暫無魔物目擊情報");
    loadingStyle.value = false;
  }
};

function mapSwitch() {
  showMap.value = !showMap.value;
  markersLayer.value.clearLayers();

  if (filteredMonsterList.value?.length > 0) {
    filteredMonsterList.value.forEach((monster) => {
      L.marker([monster.lat, monster.lng], {
        icon: L.icon({
          iconUrl: `/images/${monster.monsterName}.png`,
          iconSize: [50, 50],
        }),
        opacity: 1.0,
      }).addTo(markersLayer.value);
    });
  }
}

onMounted(async () => {
  const submitedData = JSON.parse(localStorage.getItem("submitedData"));
  if (submitedData) {
    const { monsterName, round, rare } = submitedData;
    eyewitnessInfo.monsterName = monsterName;
    eyewitnessInfo.round = round;
    eyewitnessInfo.rare = rare;
  }
});
</script>

<template>
  <div class="container">
    <button class="map" @click="mapSwitch">
      <font-awesome-icon icon="fa-solid fa-map" size="xl" />
    </button>
    <button
      class="filter"
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#announceModal"
      @click="() => (filterMode = true)"
    >
      <font-awesome-icon icon="fa-solid fa-filter" size="xl" />
    </button>
    <button
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#announceModal"
      class="announce"
      @click="() => (filterMode = false)"
    >
      <font-awesome-icon icon="fa-solid fa-arrow-up-from-bracket" size="xl" />
    </button>
    <button class="search" @click="fetchMonsterList">
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" size="xl" />
    </button>
  </div>

  <div
    class="modal fade"
    id="announceModal"
    tabindex="-1"
    aria-labelledby="announceModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 v-show="!filterMode" class="modal-title fs-5" id="announceModalLabel">
            發布目擊情報
          </h1>
          <h1 v-show="filterMode" class="modal-title fs-5" id="announceModalLabel">
            篩選目擊情報
          </h1>
        </div>
        <div class="modal-body">
          <div
            class="content-group d-flex justify-content-center align-items-center mb-3"
          >
            <div class="round-and-rare d-flex flex-column align-items-center">
              <div class="round d-flex justify-content-center align-items-center mx-3">
                <font-awesome-icon
                  v-for="n in 6"
                  :icon="`fa-solid fa-${n}`"
                  size="xl"
                  class="round-check"
                  :class="{
                    checked: filterMode
                      ? filterData.round === n
                      : eyewitnessInfo.round === n,
                  }"
                  @click="
                    () => {
                      if (filterMode) {
                        filterData.round = n;
                      } else {
                        eyewitnessInfo.round = n;
                        eyewitnessInfo.rare = n + 4;
                      }
                    }
                  "
                />
              </div>

              <div class="rare d-flex justify-content-center px-3">
                <font-awesome-icon
                  icon="fa-solid fa-star"
                  size="xl"
                  class="rare-check"
                  :style="{ color: filterMode && filterData.rare < 5 ? '' : 'orange' }"
                  @click="
                    () => {
                      if (filterMode) {
                        filterData.rare = 5;
                      } else {
                        eyewitnessInfo.rare = 5;
                      }
                    }
                  "
                />

                <font-awesome-icon
                  v-for="n in filterMode ? 5 : eyewitnessInfo.round - 1"
                  icon="fa-solid fa-star"
                  size="xl"
                  class="rare-check"
                  :class="{
                    'purple-star': filterMode
                      ? filterData.rare >= n + 5
                      : eyewitnessInfo.rare >= n + 5,
                  }"
                  @click="
                    () => {
                      if (filterMode) {
                        filterData.rare = n + 5;
                      } else {
                        eyewitnessInfo.rare = n + 5;
                      }
                    }
                  "
                />
              </div>
            </div>

            <div v-show="!filterMode" class="park ms-2">
              <font-awesome-icon
                icon="fa-solid fa-tree"
                size="2xl"
                class="park-icon"
                :class="{ 'park-check': eyewitnessInfo.isPark }"
                @click="() => (eyewitnessInfo.isPark = !eyewitnessInfo.isPark)"
              />
            </div>
          </div>

          <div class="monster-name d-flex justify-content-evenly">
            <img
              v-for="monsterName in rareMonsterList"
              class="monster-img"
              :class="{
                'name-check': filterMode
                  ? filterData.monsterName === monsterName
                  : eyewitnessInfo.monsterName === monsterName,
              }"
              :src="'/images/' + monsterName + '.png'"
              :alt="monsterName + '的圖片'"
              @click="
                () => {
                  if (filterMode) {
                    filterData.monsterName = monsterName;
                  } else {
                    eyewitnessInfo.monsterName = monsterName;
                  }
                }
              "
            />
          </div>

          <div class="show-distance d-flex justify-content-center">
            <button
              v-show="filterMode"
              class="nearby p-2 m-2"
              :class="{ check: filterData.distance === 30 }"
              @click="() => (filterData.distance = 30)"
            >
              附近魔物
            </button>
            <button
              v-show="filterMode"
              class="all p-2 m-2"
              :class="{ check: filterData.distance === 0 }"
              @click="() => (filterData.distance = 0)"
            >
              所有魔物
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button
            v-show="!filterMode"
            type="button"
            class="btn btn-secondary close"
            data-bs-dismiss="modal"
          >
            取消
          </button>
          <button
            v-show="!filterMode"
            type="button"
            class="btn btn-primary announce-submit"
            @click="handleSubmit"
            data-bs-dismiss="modal"
          >
            送出
          </button>
          <button
            v-show="filterMode"
            type="button"
            class="btn btn-warning announce-submit"
            @click="
              () => {
                filterData.round = 0;
                filterData.rare = 0;
                filterData.monsterName = '';
                filterData.distance = 30;
              }
            "
          >
            重置
          </button>
          <button
            v-show="filterMode"
            type="button"
            class="btn btn-primary announce-submit"
            data-bs-dismiss="modal"
            @click="handelFilter"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 180px;
  background-color: #fcf4e9;
  border-top: 5px solid #c0b08e;
  border-radius: 0 0 30px 30px;
  position: relative;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  & button {
    width: 65px;
    height: 65px;
    background-color: rgba(226, 240, 214, 0.45);
    border: 1px solid #c0b08e;
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background-color: rgba(226, 240, 214, 0.45);
      border: 1px solid #c0b08e;
      opacity: 0.3;
    }

    &:active {
      background-color: rgb(226, 240, 214);
      border: 1px solid #83765b;
      opacity: 1;
    }
  }
}
.form-check {
  .form-check-input {
    width: 21px;
    height: 21px;
    margin-right: 10px;
    margin-bottom: 20px;
  }
  .park-area {
    font-size: 1.2rem;
  }
}

span {
  width: 110px;
}

.content-group {
  width: 100%;
  .round,
  .rare {
    width: 100%;
    height: 40px;
    margin-bottom: 5px;
    background-color: #e2f0d6;
    border-radius: 50px;
    color: rgba(128, 128, 128, 0.3);

    .round-check {
      margin: 0 10px;
      cursor: pointer;
      &.checked {
        color: rgb(179, 56, 56);
        font-weight: 700;
      }
    }
    .rare-check {
      margin: 5px 4px;
      cursor: pointer;
      &.purple-star {
        color: rgb(167, 89, 167);
      }
    }
  }

  .park {
    height: 100%;
    padding: 29px 20px;
    background-color: #e2f0d6;
    border-radius: 15px;
    .park-icon {
      color: rgba(128, 128, 128, 0.3);
    }
    .park-check {
      color: rgb(62, 123, 62);
      opacity: 1;
    }
  }
}

.monster-name {
  margin: 5%;
  .monster-img {
    width: 20%;
    max-width: 100px;
    opacity: 0.4;
    &.name-check {
      opacity: 1;
    }
  }
}

.show-distance {
  button {
    width: 100px;
    border-radius: 50px;
    background-color: #e2f0d6;
    color: rgba(128, 128, 128, 0.7);
    font-weight: 500;
    &.check {
      border: 1px solid #c0b08e;
      color: black;
    }
  }
}

.map {
    pointer-events: none;
    background-color: #c0b08e;
    opacity: 0.3;
  }


#announceModal {
  .modal-content {
    background-color: #fcf4e9;
  }
}
</style>
