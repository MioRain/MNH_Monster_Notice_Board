<script setup>
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";

const { monsterList } = useEyewitnessInfoStore();
</script>

<template>
  <div class="container">
    <div v-if="monsterList.value?.length > 0" v-for="info in monsterList.value" class="monster-card">
      <img
        class="monster-img"
        :src="'../..//public/images/' + info[3] + '.png'"
        :alt="info[3] + '的圖片'"
      />

      <div class="info">
        <div>編號：{{ info[0] }} ｜ 周目：{{ info[4] }} ｜ 星數：{{ info[5] }}</div>
        <div>
          距離 <span style="color: #a95620">{{ info[3] }}</span> 約
          {{
            Math.floor(info[9]) > 0
              ? info[9] + " 公里"
              : parseInt(info[9].toString().slice(-3)) + " 公尺"
          }}
        </div>
        <div class="action">
          <div class="coordinate">
            <a :href="info[8]" target="_blank">鎖定座標</a>
          </div>
          <button class="hunted">討伐完成</button>
        </div>
      </div>
    </div>

    <div v-else class="monster-card">
      <div class="info">暫無魔物目擊情報</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: scroll;

  .monster-card {
    width: 80%;
    margin-top: 20px;
    padding: 3%;
    border-radius: 20px;
    background-color: #e2f0d6;
    box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;

    .monster-img {
      width: 20%;
      max-width: 100px;
      margin-right: 5%;
    }

    .info {
      display: flex;
      flex-direction: column;
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
          margin: 0 10px;
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

    @media (min-width: 435px) {
      .info {
        font-size: 1rem;
        & div {
          margin-bottom: 10px;
        }
      }
    }

    @media (min-width: 768px) {
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
