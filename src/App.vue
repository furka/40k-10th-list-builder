<script setup>
import { reactive, onMounted, onUnmounted, watch, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import ArmyList from "./components/ArmyList.vue";
import ArmyCodex from "./components/ArmyCodex.vue";
import ToolBar from "./components/ToolBar.vue";
import { FACTIONS } from "./utils/data-reader";
import PACKAGE from "../package.json";
import PrintableArmyList from "./components/PrintableArmyList.vue";

function save(key, val = appData[key]) {
  localStorage.setItem(key, JSON.stringify(val));
}

function restore(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return;
  }
}

const appData = reactive({
  units: restore("units") || [],
  currentList: restore("currentList") || createNewList(),
  lists: restore("lists") || [],
  bin: [],
  collection: restore("collection") || [],
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
  appData.currentList.units.unshift({
    id: uuidv4(),
    name: unit.name,
    points: size.points,
    models: size.models,
    optionName: size.name,
    bonus: size.bonus,
  });
}

function createNewList(faction, detachment) {
  return {
    name: "",
    faction: faction || FACTIONS[0].name,
    detachment: detachment || FACTIONS[0].detachments[0].name,
    maxPoints: 2000,
    modifiedDate: Date.now(),
    units: [],
    version: PACKAGE.version,
  };
}

function newList() {
  const faction = appData.currentList.faction;
  const detachment = appData.currentList.detachment;
  appData.lists.unshift(appData.currentList);
  appData.currentList = createNewList(faction, detachment);
}

watch(appData, () => {
  save("units");
  save("currentList");
  save("lists");
  save("collection");
});

watch(
  () => appData.bin,
  () => appData.bin.splice(0)
);

watch(
  () => appData.currentList.units.length,
  () => (appData.currentList.modifiedDate = Date.now())
);

watch(
  () => appData.currentList.faction,
  () => {
    appData.codexFilter = "";
    appData.editCollection = false;
    appData.currentList.detachment = FACTIONS.find(
      (f) => f.name === appData.currentList.faction
    ).detachments[0]?.name;
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
    <ToolBar class="app__toolbar" :app-data="appData" @new-list="newList" />
    <div class="app__body">
      <ArmyList :app-data="appData" />
      <ArmyCodex :app-data="appData" @add="addUnit" />
    </div>
    <div class="version">version {{ PACKAGE.version }}</div>
  </div>
  <PrintableArmyList :app-data="appData" class="print" />
</template>

<style scoped lang="scss">
.app {
  --font-family: Calibri, sans-serif;
  --toolbar-height: 88px;
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

.print {
  display: none;
  font-family: monospace;
}

@media print {
  .app {
    display: none;
  }
  .print {
    display: block;
  }
}
</style>
