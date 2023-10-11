<template>
  <div class="container">
    <button class="announce">發布</button>
    <button class="city">城市</button>
    <button class="monster">魔物</button>
    <button class="search">搜尋</button>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100px;
  border-top: 5px solid #c0b08e;
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
</style>
