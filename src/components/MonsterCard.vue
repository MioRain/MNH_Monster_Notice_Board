<script setup>
import { useEyewitnessInfoStore } from "@/stores/eyewitness-info";

const { monsterList } = useEyewitnessInfoStore();
</script>

<template>
  <div class="container">
    <a v-if="monsterList.value" v-for="info in monsterList.value" :href="info[8]" target="_blank" class="monster-card">
      <img class="monster-img" src="../..//public/images/g-jagr.png" alt="g-jagr's image">
      <div class="info">
        編號：{{info[0]}} ｜ 周目：{{info[4]}} ｜ 星數：{{info[5]}}
        <br>
        距離 <span style="color: #A95620;">{{info[3]}}</span> 500 公尺
      </div>
    </a>

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
      color: #3a2f26;
      font-size: 1.2rem;
      line-height: 2rem;
      text-align: center;
    }
  }
}
</style>
