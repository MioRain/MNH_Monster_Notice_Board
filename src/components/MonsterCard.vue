<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";
import { useUserDataStore } from "@/stores/user-data";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useStateStore } from "@/stores/state";
import OpenStreetMap from "../components/OpenStreetMap.vue";
import axios from "axios";

const stateStore = useStateStore();
const { monsterList, filteredMonsterList } = useEyewitnessInfoStore();
const { filterData, getSheetNameAndExpiredTime, addMarker } = useUserDataStore();
const { toggleMap } = storeToRefs(stateStore);

const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycbxMC_lZmSSp7baWOZesfIKYUSJuJN_5dokrBYebjDr86Kb-lr8mH-FAoUZT2GxofgzVWA/exec";

const remove = async (action, serialNum, index) => {
  if (confirm(action === "hunted" ? "是否確定討伐？" : "是否確定移除？")) {
    const date = moment().format("YYYY/M/D");
    const targetMonster = monsterList.value.find((item) => item.serialNum === serialNum);

    if ((action === "hunted" || action === "removed") && filterData.date === date) {
      const actionKey = `${action}Num`;
      filterData[actionKey].push(serialNum);
      filterData.filteredNum.push(serialNum);

      if (action === "hunted") {
        targetMonster.isHunted = true;
      } else if (action === "removed") {
        targetMonster.isRemoved = true;
      }
    } else {
      filterData.date = date;
      const actionKey = `${action}Num`;
      filterData[actionKey] = [serialNum];
      filterData.filteredNum = [serialNum];
    }

    localStorage.setItem("filterData", JSON.stringify(filterData));
    filteredMonsterList.value.splice(index, 1);

    const { sheetName } = getSheetNameAndExpiredTime();
    const payload = {
      action,
      sheetName,
      serialNum,
    };

    addMarker();

    await axios.post(googleScriptUrl, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
};

onMounted(() => {
  const filterDataStore = JSON.parse(localStorage.getItem("filterData"));
  if (filterDataStore) {
    const {
      date,
      filteredNum,
      huntedNum,
      removedNum,
      round,
      rare,
      monsterName,
    } = filterDataStore;
    filterData.date = date;
    filterData.filteredNum = filteredNum?.length >= 0 ? filteredNum : [];
    filterData.huntedNum = huntedNum?.length >= 0 ? huntedNum : [];
    filterData.removedNum = removedNum?.length >= 0 ? removedNum : [];
    filterData.round = round;
    filterData.rare = rare;
    filterData.monsterName = monsterName;
  }
});
</script>

<template>
  <div class="map-container" :class="{ hidden: !toggleMap }">
    <OpenStreetMap />
  </div>
  <div class="container d-flex flex-wrap justify-content-center align-content-start">
    <div
      v-if="filteredMonsterList.value?.length > 0"
      v-for="(info, index) in filteredMonsterList.value"
      class="monster-card d-flex justify-content-center pb-4"
      :class="{ disable: info.isHunted || info.isRemoved }"
    >
      <button class="remove" @click="remove('removed', info.serialNum, index)">Ｘ</button>
      <img v-if="/true/i.test(info.isPark)" class="park-img" src="/images/tree.png" />
      <div v-if="info.isHunted || info.isRemoved" class="cover">
        <img
          :class="{ fail: info.isRemoved, complete: info.isHunted }"
          :src="info.isRemoved ? '/images/fail.png' : '/images/complete.png'"
        />
      </div>

      <div class="monster-img-container d-flex flex-column">
        <div class="monster-rare d-flex justify-content-center mb-2">
          <FontAwesomeIcon
            v-if="info.rare === 5"
            v-for="n in 5"
            style="color: orange"
            icon="fa-solid fa-star"
            size="xs"
          />
          <FontAwesomeIcon
            v-if="info.rare > 5"
            v-for="n in info.rare - 5"
            style="color: rgb(167, 89, 167)"
            icon="fa-solid fa-star"
            size="xs"
          />
        </div>

        <img
          class="monster-img"
          :src="'/images/' + info.monsterName + '.png'"
          :alt="info[3] + '的圖片'"
        />
      </div>

      <div class="info f-flex flex-colunm">
        <div>編號：{{ info.serialNum }} ｜ 周目：{{ info.round }}</div>
        <div>
          距離 <span style="color: #a95620">{{ info.monsterName }}</span> 約
          {{
            Math.floor(info.distance) > 0
              ? info.distance + " 公里"
              : parseInt(info.distance.toString().slice(-3)) + " 公尺"
          }}
        </div>
        <div class="action">
          <div class="coordinate">
            <a :href="info.mapLink" target="_blank">鎖定座標</a>
          </div>
          <button class="hunted" @click="remove('hunted', info.serialNum, index)">
            討伐完成
          </button>
        </div>
      </div>

      <div class="like-ratio" :style="{ '--like-ratio': info.likeRatio }">
        <span>{{ info.likeRatio }}</span>
      </div>
    </div>

    <div v-else class="monster-card">
      <div class="info">暫無魔物目擊情報</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-container {
  height: 30%;
  width: calc(70% + 60px);
  margin-top: 20px;
  border: 3px solid #c0b08e;
  border-radius: 30px;
  position: absolute;
  z-index: 1;
  bottom: 120px;
  background-color: #fcf4e9;
  &.hidden {
    width: 50%;
    z-index: -1;
  }
}
.container {
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  border-radius: 30px;
  background-color: #fcf4e9;
  overflow: scroll;
  position: relative;
  z-index: 0;

  .monster-card {
    width: 300px;
    height: 145px;
    margin-top: 20px;
    padding: 15px;
    border-radius: 20px;
    background-color: #e2f0d6;
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.2);
    position: relative;

    &.disable {
      pointer-events: none;
    }

    .remove {
      width: 35px;
      position: absolute;
      top: 0;
      right: 0;
      border-radius: 3px 20px 3px 20px;
      background-color: #c0b08e;
      font-size: 0.8rem;
    }

    .park-img {
      width: 30px;
      height: 40px;
      border: 1px solid white;
      border-radius: 10px;
      background-color: #e2f0d6;
      position: absolute;
      top: -10px;
      left: -15px;
    }
    .cover {
      width: 100%;
      height: 100%;
      padding: 10%;
      border-radius: 20px;
      position: absolute;
      top: 0;
      z-index: 10;
      background-color: rgba(255, 255, 255, 0.5);

      .complete,
      .fail {
        width: 100%;
        height: 100%;
        position: relative;
      }
      .fail {
        width: 90%;
        height: 90%;
        top: 5%;
        left: 5%;
        transform: rotate(-7deg);
      }
    }
    .monster-img-container {
      width: 25%;
      max-width: 100px;
      margin-right: 5%;
    }

    .info {
      width: 65%;
      color: #3a2f26;
      font-size: 0.8rem;
      line-height: 1.5rem;
      text-align: center;

      & div {
        margin-bottom: 3px;
      }

      .action {
        display: flex;
        justify-content: center;

        .coordinate,
        .hunted {
          margin: 5px 10px;
          padding: 2% 4.5%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #c0b08e;
          color: black;
          border-radius: 5px;

          & a {
            color: black;
          }
        }
      }
    }

    .like-ratio {
      width: 88%;
      height: 6%;
      position: absolute;
      bottom: 3%;
      border-radius: 50px;
      background-color: rgba(128, 128, 128, 0.6);

      &::before {
        content: "";
        width: var(--like-ratio);
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        border-radius: 50px;
        background-color: #a957209a;
      }

      & span {
        position: absolute;
        top: -18px;
        left: max(0%, calc(var(--like-ratio) - 25px));
        font-size: 0.9rem;
      }
    }
  }
}
@media (min-width: 435px) {
  .map-container {
    width: 70%;
    bottom: 160px;
  }
  .container {
    .park-img {
      width: 40px;
      height: 50px;
      top: -10px;
      left: -20px;
    }
    .info {
      font-size: 1rem;
      & div {
        margin-bottom: 10px;
      }
    }
  }
}

@media (min-width: 768px) {
  .map-container {
    height: 38%;
    bottom: 160px;
  }

  .container {
    .monster-card {
      margin: 10px;
    }
    .remove {
      width: 50px;
      font-size: 1rem;
    }
    .park-img {
      width: 50px;
      height: 60px;
      top: -10px;
      left: -25px;
    }
    .info {
      font-size: 1.2rem;
      & div {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
