<script setup>
import { reactive, onMounted, onUnmounted, watch, ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import ArmyList from "./components/ArmyList.vue";
import ArmyCodex from "./components/ArmyCodex.vue";
import { DATA_SHEETS, FACTIONS, MFM_VERSION } from "./utils/data-reader";
import PACKAGE from "../package.json";
import PrintableArmyList from "./components/PrintableArmyList.vue";
import { GROUP_NONE, SORT_ALPHABETICAL } from "./data/constants";
import AppToolBar from "./components/AppToolBar.vue";
import { deserializeList } from "./utils/serialize-list";

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
  appHeight: window.innerHeight,
  appWidth: window.innerWidth,
  armyName: "",
  bin: [],
  codexFilter: "",
  collection: restore("collection") ?? [],
  compendium: DATA_SHEETS,
  currentList: restore("currentList") ?? createNewList(),
  editCollection: false,
  factions: FACTIONS,
  group: restore("group") ?? GROUP_NONE,
  lists: restore("lists") ?? [],
  showForgeWorld: restore("showForgeWorld") ?? true,
  sortOrder: restore("sortOrder") ?? SORT_ALPHABETICAL,
  units: restore("units") ?? [],
});

const searchParams = new URLSearchParams(window.location.search);

if (searchParams.size) {
  try {
    const list = deserializeList(searchParams);
    appData.lists.unshift(appData.currentList);
    appData.currentList = list;
    save("lists");
    save("currentList");
  } catch (e) {
    console.error(e);
  }
  if (history.pushState) {
    const url =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname;
    window.history.pushState({ path: url }, "", url);
  }
}

const handleResize = () => {
  appData.appHeight = window.innerHeight;
  appData.appWidth = window.innerWidth;
};

function addUnit(unit, size) {
  appData.currentList.units.unshift({
    id: uuidv4(),
    bonus: size.bonus,
    models: size.models,
    name: unit.name,
    optionName: size.name,
    points: size.points,
  });
}

function createNewList(faction, detachment) {
  return {
    detachment: detachment || FACTIONS[0].detachments[0].name,
    faction: faction || FACTIONS[0].name,
    maxPoints: 2000,
    mfm_version: MFM_VERSION,
    modifiedDate: Date.now(),
    name: "",
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
  save("collection");
  save("currentList");
  save("lists");
  save("group");
  save("showForgeWorld");
  save("sortOrder");
  save("units");
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
    <AppToolBar class="app__toolbar" :app-data="appData" @new-list="newList" />
    <div class="app__body">
      <ArmyList :app-data="appData" />
      <ArmyCodex :app-data="appData" @add="addUnit" />
    </div>
    <div class="version">
      <span> app version {{ PACKAGE.version }} </span>
      <span> Munitorum Field Manual {{ MFM_VERSION.toLowerCase() }} </span>
    </div>
  </div>
  <PrintableArmyList :app-data="appData" class="print" />
</template>

<style scoped lang="scss">
.app {
  --font-family: Calibri, sans-serif;
  --toolbar-height: 44px;
  background-color: #111;
  font-family: var(--font-family);
  position: relative;
  overflow: hidden;

  &__toolbar {
    height: var(--toolbar-height);
  }

  &__body {
    display: flex;
    height: calc(100svh - var(--toolbar-height));
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .version {
    position: absolute;
    bottom: 0;
    right: 0;
    color: #fff;
    font-size: 12px;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    z-index: 2;

    span {
      padding: 0 4px;
      background-color: rgba(0, 0, 0, 0.5);
    }
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
