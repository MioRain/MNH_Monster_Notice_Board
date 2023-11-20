<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserDataStore } from "@/stores/user-data";
import { useStateStore } from "@/stores/state";
import L from "leaflet";

const userDataStore = useUserDataStore();
const stateStore = useStateStore();
const { getCurrentPosition, openStreetMap, markersLayer } = useUserDataStore();
const { currentLatitude, currentLongitude } = storeToRefs(userDataStore);
const { toggleMap } = storeToRefs(stateStore);

onMounted(async () => {
  await getCurrentPosition();

  openStreetMap.value = L.map("map", {
    center: [currentLatitude.value, currentLongitude.value],
    zoom: 15,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
  }).addTo(openStreetMap.value);

  L.marker([currentLatitude.value, currentLongitude.value]).addTo(openStreetMap.value);

  markersLayer.value = L.layerGroup();
  markersLayer.value.addTo(openStreetMap.value);
});
</script>

<template>
  <div id="map" class="d-flex justify-content-center align-items-center">
    <span>Loading...</span>
  </div>
</template>

<style lang="scss" scoped>
#map {
  height: 100%;
  width: 100%;
  border-radius: 30px;
}
</style>
