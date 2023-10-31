# MHN_monster_radar_vue

以 Monster Hunter Now 的活動遊玩體驗為發想

用 Vue 搭配 Google Sheet 的 Side Project

可以根據其他玩家上傳的資料來搜尋附近有哪些魔物，並根據玩家座標位置計算與魔物的距離

### 功能介紹

``
*指定城市、魔物篩選功能尚未開發
``
1. 點擊「發布」可以上傳魔物情報。
2. 點擊「搜尋」可以尋找所有魔物情報（顯示順序依照玩家所在地為中心，根據魔物距離由近及遠至遠）。
3. 顯示的魔物情報點擊「鎖定座標」會開啟新視窗於 google map 上顯示經緯座標。
4. 點擊「討伐完成」即可刪除該魔物情報。」
5. 資料庫情報以每三小時為間隔（2.5.8.11.14.17.20.23 整點），若發布情報為公園地區則可能有誤。

[google 資料庫連結](https://docs.google.com/spreadsheets/d/1z4vV88d9-MQvJNsDI0YF3x1amLOso8bPlwFBYkfOsKo/edit?usp=sharing)