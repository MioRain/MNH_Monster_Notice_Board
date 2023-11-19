<script setup>
import { onMounted } from "vue";
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";
import { useUserDataStore } from "@/stores/user-data";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";

const { filteredMonsterList } = useEyewitnessInfoStore();
const { filterData, getSheetNameAndExpiredTime } = useUserDataStore();

const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycby1mKeTOO9bSG8BdwdSH_MjxDr_UkXL2p6ZJZ000XBnLa3Sx-77ATEde54OvYF1BkX9ig/exec";

const remove = async (action, serialNum, index) => {
  if (confirm(action === 'hunted' ? "是否確定討伐？" : "是否確定移除？")) {
    const date = moment().format("YYYY/M/D");

    if (filterData.date === date) {
      filterData.filteredNum.push(serialNum);
    } else {
      filterData.date = date;
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
    const { date, filteredNum, round, rare, monsterName } = filterDataStore;
    filterData.date = date;
    filterData.filteredNum = filteredNum;
    filterData.round = round;
    filterData.rare = rare;
    filterData.monsterName = monsterName;
  }
});
</script>

<template>
  <div class="container d-flex flex-column align-items-center">
    <div
      v-if="filteredMonsterList.value?.length > 0"
      v-for="(info, index) in filteredMonsterList.value"
      class="monster-card d-flex justify-content-center pb-4"
    >
      <button class="remove" @click="remove('removed', info.serialNum, index)">Ｘ</button>
      <img v-if="/true/i.test(info.isPark)" class="park-img" src="/images/tree.png" />

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
          <button class="hunted" @click="remove('hunted', info.serialNum, index)">討伐完成</button>
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
.container {
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  overflow: scroll;

  .monster-card {
    width: 88%;
    margin-top: 20px;
    padding: 5% 3%;
    border-radius: 20px;
    background-color: #e2f0d6;
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.2);
    position: relative;

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

    @media (min-width: 435px) {
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

    @media (min-width: 768px) {
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
}
</style>
