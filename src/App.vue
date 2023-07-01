<script setup>
import { reactive, onMounted, onUnmounted, watch, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import ArmyList from "./components/ArmyList.vue";
import ArmyCodex from "./components/ArmyCodex.vue";
import ToolBar from "./components/ToolBar.vue";
import { FACTIONS } from "./data/factions";
import PACKAGE from "../package.json";

function save(key, val = appData[key]) {
  localStorage.setItem(key, JSON.stringify(val));
}

function restore(key) {
  return JSON.parse(localStorage.getItem(key));
}

const appData = reactive({
  units: restore("units") || [],
  bin: [],
  collection: restore("collection") || [],
  maxPoints: restore("maxPoints") || 2000,
  faction: restore("faction") || "Necrons",
  detachment: restore("detachment") || "Awakened Dynasty",
  codexFilter: "",
  armyName: "",
  editCollection: false,
  appHeight: window.innerHeight,
  appWidth: window.innerWidth,
  compendium: FACTIONS,
});

const handleResize = () => {
  appData.appHeight = window.innerHeight;
  appData.appWidth = window.innerWidth;
};

function addUnit(unit, size) {
  unit = JSON.parse(JSON.stringify(unit));

  unit.points = size.points;
  unit.models = size.models;
  unit.optionName = size.name;
  unit.id = uuidv4();

  appData.units.unshift(unit);
}

watch(appData, () => {
  save("units");
  save("collection");
  save("maxPoints");
  save("faction");
  save("detachment");
});

watch(
  () => appData.bin,
  () => appData.bin.splice(0)
);

watch(
  () => appData.faction,
  () => {
    appData.units.splice(0);
  }
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
    <ToolBar class="app__toolbar" :app-data="appData" />
    <div class="app__body">
      <ArmyList :app-data="appData" />
      <ArmyCodex :app-data="appData" @add="addUnit" />
    </div>
    <div class="version">version {{ PACKAGE.version }}</div>
  </div>
</template>

<style scoped lang="scss">
.app {
  --font-family: Calibri, sans-serif;
  --toolbar-height: 50px;
  background-color: #111;
  font-family: var(--font-family);
  position: relative;
  overflow: hidden;

  &__toolbar {
    height: var(--toolbar-height);
  }

  &__body {
    display: flex;
    justify-content: center;
    height: calc(100svh - var(--toolbar-height));
  }

  .version {
    position: absolute;
    bottom: 0;
    right: 0;
    color: #fff;
    font-size: 12px;
    background-color: rgba(0, 0, 0, 0.75);
    padding: 0 4px;
    pointer-events: none;
  }
}
</style>
