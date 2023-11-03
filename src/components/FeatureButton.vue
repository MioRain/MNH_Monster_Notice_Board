<script setup>
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/user-data";
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";
import { useStateStore } from "@/stores/state";
import axios from "axios";

const userDataStore = useUserDataStore();
const stateStore = useStateStore();
const { huntedList, getCurrentPosition, getSheetNameAndExpiredTime } = useUserDataStore();
const { currentLatitude, currentLongitude } = storeToRefs(userDataStore);
const { loadingStyle } = storeToRefs(stateStore);
const { eyewitnessInfo, monsterList, getDistance } = useEyewitnessInfoStore();

const googleScriptUrl =
  "https://script.google.com/macros/s/AKfycbxdvhrjecBvh7pgIUMO_139MU1Y21Z3i5Hm8ow78sWsrD8FPjy_c7mnU-PK7D-yL0y_ZQ/exec";

const handleSubmit = async () => {
  if (
    eyewitnessInfo.round > 5 ||
    eyewitnessInfo.round < 1 ||
    eyewitnessInfo.rare > 10 ||
    eyewitnessInfo.rare < 1
  ) {
    alert("周目(1~5)或星數(1~10)超過範圍");
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
    const { sheetName, expiredTime } = getSheetNameAndExpiredTime(eyewitnessInfo.isPark);
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
    loadingStyle.value = false;
    alert(res.data);
  } else {
    return;
  }
};

const fetchMonsterList = async () => {
  try {
    const now = encodeURIComponent(moment().format());
    const { sheetName } = getSheetNameAndExpiredTime(eyewitnessInfo.isPark);

    loadingStyle.value = true;

    const res = await axios.get(googleScriptUrl + `?sheetName=${sheetName}&now=${now}`);
    await getCurrentPosition();

    if (huntedList?.huntedNum?.length > 0) {
      res.data = res.data.filter((data) => !huntedList.huntedNum.includes(data[0]));
    }

    const tempRes = res.data.map((data) => {
      let distance = getDistance(
        currentLatitude.value,
        currentLongitude.value,
        data[7],
        data[8],
        "K"
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
        mapUrl: data[9],
        expiredTime: data[10],
        distance: Number.parseFloat(distance).toFixed(3),
      };

      return monsterInfo;
    });

    tempRes.sort((a, b) => a.distance - b.distance);
    monsterList.value = tempRes;

    loadingStyle.value = false;
  } catch (error) {
    console.error(error);
    monsterList.value = [];
    alert("暫無魔物目擊情報");
    loadingStyle.value = false;
  }
};
</script>

<template>
  <div class="container">
    <button class="map">地圖</button>
    <button class="monster">魔物</button>
    <button
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal"
      class="announce"
    >
      發布
    </button>
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
          <div class="form-check">
            <label class="form-check-label park-area" for="flexCheckDefault">
              是否為公園地區？
            </label>
            <input
              class="form-check-input"
              type="checkbox"
              id="flexCheckDefault"
              v-model="eyewitnessInfo.isPark"
            />
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default">目擊魔物</span>
            <select
              class="form-control"
              id="monster"
              name="monster"
              v-model="eyewitnessInfo.monsterName"
            >
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
              <!-- <option>蒼火龍</option> -->
              <option>雌火龍</option>
              <option>櫻火龍</option>
            </select>
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default">周目(1~5)</span>
            <input
              type="number"
              class="form-control"
              aria-label="round"
              id="round"
              name="round"
              min="1"
              max="5"
              inputmode="numeric"
              v-model="eyewitnessInfo.round"
            />
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text" id="inputGroup-sizing-default"
              >星數(1~10)</span
            >
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

  .map,
  .monster {
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
</style>
