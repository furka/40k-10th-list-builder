<script setup>
import { reactive, onMounted, onUnmounted, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import NECRONS from "./data/necrons.json";
import ArmyList from "./components/ArmyList.vue";
import ArmyCodex from "./components/ArmyCodex.vue";

const appData = reactive({
  units: [],
  bin: [],
  maxPoints: 2000,
  appHeight: window.innerHeight,
  appWidth: window.innerWidth,
  codex: NECRONS,
});

const handleResize = () => {
  appData.appHeight = window.innerHeight;
  appData.appWidth = window.innerWidth;
};

function addUnit(unit, size) {
  unit = JSON.parse(JSON.stringify(unit));

  unit.points = size.points;
  unit.models = size.models;
  unit.id = uuidv4();

  appData.units.unshift(unit);
}

watch(
  () => appData.bin,
  () => appData.bin.splice(0)
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="app">
    <ArmyList :app-data="appData" />
    <ArmyCodex :app-data="appData" @add="addUnit" />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  font-family: Calibri, sans-serif;
  column-gap: 16px;
  overflow: hidden;
}
</style>
