<script setup>
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/user-data";
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";
import { useStateStore } from "@/stores/state";
import axios from "axios";

const userDataStore = useUserDataStore();
const stateStore = useStateStore();
const { getCurrentPosition, getSheetName, getTodayData } = useUserDataStore();
const { currentLatitude, currentLongitude } = storeToRefs(userDataStore);
const { loadingStyle } = storeToRefs(stateStore);
const { eyewitnessInfo, monsterList, getDistance } = useEyewitnessInfoStore();

const googleScriptUrl =
    "https://script.google.com/macros/s/AKfycbyxbb898unGj27htJWaoloG7cTJL8ms15q52AKkCCZ5WIkm9_oZ292SFNqACUP7WrvgMQ/exec";

const handleSubmit = async () => {
  loadingStyle.value = true;
  await getCurrentPosition();

  const todayData = getTodayData()
  const time = `${todayData.year}/${todayData.month}/${todayData.date} ${todayData.hour}:${todayData.minute}`;
  const sheetName = getSheetName(todayData.hour);

  const payload = {
    sheetName,
    time,
    cityName: eyewitnessInfo.cityName,
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

  loadingStyle.value = false;
  alert(res.data);
};

const fetchMonsterList = async () => {
  const todayData = getTodayData()
  const sheetName = getSheetName(todayData.hour);
  
  loadingStyle.value = true;

  const res = await axios.get(googleScriptUrl + `?time=${sheetName}`);
  await getCurrentPosition();

  const tempRes = res.data.map((data) => {
    let distance = getDistance(
      currentLatitude.value,
      currentLongitude.value,
      data[6],
      data[7],
      "K"
    );
    distance = Number.parseFloat(distance).toFixed(3);
    data.push(distance);
    return data;
  });

  tempRes.sort((a, b) => a[a.length - 1] - b[b.length - 1]) 
  monsterList.value = tempRes;

  loadingStyle.value = false;
};
</script>

<template>
  <div class="container">
    <button
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal"
      class="announce"
    >
      發布
    </button>
    <button class="city">城市</button>
    <button class="monster">魔物</button>
    <button class="search" @click="fetchMonsterList">搜尋</button>
  </div>

  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">發布目擊情報</h1>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default">目擊縣市</span>
            <select
              class="form-control"
              id="city"
              name="city"
              v-model="eyewitnessInfo.cityName"
            >
              <option value="" disabled selected>選擇縣市</option>
              <option>台北市</option>
              <option>新北市</option>
              <option>桃園市</option>
              <option>宜蘭縣</option>
              <option>基隆市</option>
              <option>新竹市</option>
              <option>新竹縣</option>
              <option>台中市</option>
              <option>苗栗縣</option>
              <option>彰化縣</option>
              <option>南投縣</option>
              <option>雲林縣</option>
              <option>嘉義市</option>
              <option>嘉義縣</option>
              <option>台南市</option>
              <option>高雄市</option>
              <option>屏東縣</option>
              <option>花蓮縣</option>
              <option>台東縣</option>
              <option>金門縣</option>
              <option>連江縣</option>
              <option>澎湖縣</option>
              <option>其他</option>
            </select>
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default">目擊魔物</span>
            <select
              class="form-control"
              id="monster"
              name="monster"
              v-model="eyewitnessInfo.monsterName"
            >
              <option value="" disabled selected>選擇魔物</option>
              <option>大凶豺龍</option>
              <option>搔鳥</option>
              <option>毒妖鳥</option>
              <option>土砂龍</option>
              <option>大凶顎龍</option>
              <option>飛雷龍</option>
              <option>浮空龍</option>
              <option>泥魚龍</option>
              <option>蠻顎龍</option>
              <option>風漂龍</option>
              <option>角龍</option>
              <option>黑角龍</option>
              <option>火龍</option>
              <option>蒼火龍</option>
              <option>雌火龍</option>
              <option>櫻火龍</option>
            </select>
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default">周目</span>
            <input
              type="number"
              class="form-control"
              aria-label="round"
              id="round"
              name="round"
              min="1"
              max="999"
              inputmode="numeric"
              v-model="eyewitnessInfo.round"
            />
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default">星數</span>
            <input
              type="number"
              class="form-control"
              aria-label="rare"
              id="rare"
              name="rare"
              min="1"
              max="10"
              inputmode="numeric"
              v-model="eyewitnessInfo.rare"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary close" data-bs-dismiss="modal">
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary announce-submit"
            @click="handleSubmit"
            data-bs-dismiss="modal"
          >
            送出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100px;
  background-color: #fcf4e9;
  border-top: 5px solid #c0b08e;
  border-radius: 0 0 30px 30px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  .city, .monster {
      pointer-events: none;
      background-color: #c0b08e;
      color: white;
      opacity: 0.3;
    }

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
</style>
