<script setup>
import { reactive, onMounted, onUnmounted, watch, ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import ArmyList from "./components/ArmyList.vue";
import ArmyCodex from "./components/ArmyCodex.vue";
import { MFM } from "./utils/mfm";
import PrintableArmyList from "./components/PrintableArmyList.vue";
import { GROUP_NONE, SORT_MANUAL } from "./data/constants";
import {
  sortDataSheetAlphabetical,
  sortListPoints,
  sortListByRole,
} from "./utils/sort-functions";
import AppToolBar from "./components/AppToolBar.vue";
import CodexToolBar from "./components/CodexToolBar.vue";
import VersionBar from "./components/VersionBar.vue";
import { deserializeList } from "./utils/serialize-list";
import { autoUpgradeMFMVersion } from "./utils/mfm";
import PACKAGE from "../package.json";
import { BOARDING_ACTIONS } from "./data/configs";

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
  boardingActions: BOARDING_ACTIONS,
  codexFilter: "",
  collection: restore("collection") ?? [],
  currentList: restore("currentList") ?? createNewList(),
  editCollection: false,
  group: restore("group") ?? GROUP_NONE,
  lists: restore("lists") ?? [],
  showForgeWorld: restore("showForgeWorld") ?? false,
  showLegends: restore("showLegends") ?? false,
  showPointsChanges: restore("showPointsChanges") ?? true,
  sortOrder: restore("sortOrder") ?? "A-Z",
  units: restore("units") ?? [],
  get currentMFM() {
    const version = this.currentList?.mfm_version;
    return MFM[version] ?? null;
  },
  get compendium() {
    return (this.currentMFM || MFM.CURRENT).DATA_SHEETS;
  },
  get factions() {
    const baseFactions = (this.currentMFM || MFM.CURRENT).FACTIONS;

    return baseFactions.map(faction => {
      const baConfig = this.boardingActions[faction.name];
      if (!baConfig) {
        return faction;
      }

      const baDetachments = Object.keys(baConfig).map(detachmentName => ({
        name: detachmentName,
        boardingActions: true
      }));

      return {
        ...faction,
        detachments: [...faction.detachments, ...baDetachments]
      };
    });
  },
  get isBoardingActions() {
    const faction = this.factions.find(f => f.name === this.currentList?.faction);
    const detachment = faction?.detachments.find(d => d.name === this.currentList?.detachment);
    return detachment?.boardingActions === true;
  },
  get boardingActionsConfig() {
    if (!this.isBoardingActions) return null;
    return this.boardingActions[this.currentList?.faction]?.[this.currentList?.detachment];
  },
  get effectiveMaxPoints() {
    return this.isBoardingActions ? 500 : this.currentList.maxPoints;
  },
  get detachmentDisplayName() {
    const detachment = this.currentList?.detachment;
    if (!detachment) return '';
    const config = this.boardingActions[this.currentList?.faction]?.[detachment];
    return config?.displayName || detachment;
  },
});

function initializeApp() {
  // Normalize legacy data to uppercase
  if (appData.currentList?.detachment) {
    appData.currentList.detachment =
      appData.currentList.detachment.toUpperCase();
  }
  if (appData.currentList?.faction) {
    appData.currentList.faction = appData.currentList.faction.toUpperCase();
  }

  // Auto-upgrade lists to latest MFM if no point changes
  autoUpgradeMFMVersion(appData.currentList);
  appData.lists.forEach((list) => autoUpgradeMFMVersion(list));
  save("lists");

  // Load shared list from URL parameters
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
    // Clean up URL after importing shared list
    if (history.pushState) {
      const url =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.pushState({ path: url }, "", url);
    }
  }
}

initializeApp();

console.log(appData);

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
  });
}

function applySortToList() {
  const { currentList, compendium } = appData;
  const sortOrder = currentList.sortOrder || SORT_MANUAL;

  if (sortOrder === SORT_MANUAL) {
    return;
  }

  const units = currentList.units;

  if (sortOrder === "A-Z") {
    units.sort(sortDataSheetAlphabetical);
  } else if (sortOrder === "Expensive first") {
    units.sort(sortListPoints(appData.currentMFM, false));
  } else if (sortOrder === "Cheap first") {
    units.sort(sortListPoints(appData.currentMFM, true));
  } else if (sortOrder === "By Role") {
    units.sort(sortListByRole(compendium));
  }
}

function createNewList(faction, detachment) {
  return {
    detachment: detachment || MFM.CURRENT.FACTIONS[0].detachments[0].name,
    faction: faction || MFM.CURRENT.FACTIONS[0].name,
    maxPoints: 2000,
    mfm_version: MFM.CURRENT.MFM_VERSION,
    modifiedDate: Date.now(),
    name: "",
    sortOrder: SORT_MANUAL,
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

function track(val) {
  watch(
    () => appData[val],
    () => save(val),
    { deep: true }
  );
}

track("collection");
track("currentList");
track("lists");
track("group");
track("showForgeWorld");
track("showLegends");
track("showPointsChanges");
track("sortOrder");
track("units");

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
    appData.currentList.detachment = MFM.CURRENT.FACTIONS.find(
      (f) =>
        f.name?.toLowerCase() === appData.currentList.faction?.toLowerCase()
    )?.detachments[0]?.name;
  }
);

watch(
  () => appData.currentList.units.length,
  () => applySortToList()
);

watch(
  () => appData.currentList.sortOrder,
  () => applySortToList()
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
    <CodexToolBar class="app__codex-toolbar" :app-data="appData" />
    <div class="app__body">
      <ArmyList :app-data="appData" />
      <ArmyCodex :app-data="appData" @add="addUnit" />
    </div>
    <VersionBar :app-data="appData" />
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

  &__codex-toolbar {
    height: var(--toolbar-height);
  }

  &__body {
    display: flex;
    height: calc(100svh - (var(--toolbar-height) * 2) - 20px);
    justify-content: center;
    position: relative;
    z-index: 1;
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
