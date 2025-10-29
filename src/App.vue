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
import PACKAGE from "../package.json";
import { BOARDING_ACTIONS, CONFIGS } from "./data/configs";
import { runAllMigrations } from "./utils/legacy-migrations";

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
  collection: restore("collection") ?? {},
  currentList: restore("currentList") ?? createNewList(),
  editCollection: false,
  group: restore("group") ?? GROUP_NONE,
  lists: restore("lists") ?? [],
  showForgeWorld: restore("showForgeWorld") ?? false,
  showLegends: restore("showLegends") ?? false,
  showPointsChanges: restore("showPointsChanges") ?? true,
  sortOrder: restore("sortOrder") ?? "A-Z",
  units: restore("units") ?? [],
});

const currentMFM = computed(() => {
  const version = appData.currentList?.mfm_version;
  return MFM[version] ?? null;
});

const compendium = computed(() => {
  return (currentMFM.value || MFM.CURRENT).DATA_SHEETS;
});

const filteredCompendium = computed(() => {
  return compendium.value.filter(
    (unit) =>
      unit.faction === appData.currentList.faction ||
      unit.faction === appData.currentList.subFaction
  );
});

const factions = computed(() => {
  const baseFactions = (currentMFM.value || MFM.CURRENT).FACTIONS;

  return baseFactions.map((faction) => {
    let detachments = [...faction.detachments];

    // Add boarding actions detachments
    const baConfig = appData.boardingActions[faction.name];
    if (baConfig) {
      const baDetachments = Object.keys(baConfig).map((detachmentName) => ({
        name: detachmentName,
        boardingActions: true,
      }));
      detachments = [...detachments, ...baDetachments];
    }

    // Add subFaction detachments if this is the current faction and a subFaction is selected
    if (
      faction.name === appData.currentList?.faction &&
      appData.currentList?.subFaction
    ) {
      const subFaction = baseFactions.find(
        (f) => f.name === appData.currentList.subFaction
      );
      if (subFaction) {
        detachments = [...detachments, ...subFaction.detachments];
      }
    }

    return {
      ...faction,
      detachments,
    };
  });
});

const isBoardingActions = computed(() => {
  const faction = factions.value.find(
    (f) => f.name === appData.currentList?.faction
  );
  const detachment = faction?.detachments.find(
    (d) => d.name === appData.currentList?.detachment
  );
  return detachment?.boardingActions;
});

const boardingActionsConfig = computed(() => {
  if (!isBoardingActions.value) {
    return null;
  }
  return appData.boardingActions[appData.currentList?.faction]?.[
    appData.currentList?.detachment
  ];
});

const effectiveMaxPoints = computed(() => {
  return isBoardingActions.value ? 500 : appData.currentList.maxPoints;
});

const detachmentDisplayName = computed(() => {
  const detachment = appData.currentList?.detachment;
  if (!detachment) return "";
  const config =
    appData.boardingActions[appData.currentList?.faction]?.[detachment];
  return config?.displayName || detachment;
});

const availableSubFactions = computed(() => {
  const currentFaction = appData.currentList?.faction;
  if (!currentFaction) return [];

  return Object.keys(CONFIGS["sub-factions"]).filter((factionName) => {
    return CONFIGS["sub-factions"][factionName] === currentFaction;
  });
});

console.log(appData);

function initializeApp() {
  // Run all legacy migrations
  runAllMigrations(appData, save);

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
  const { currentList } = appData;
  const sortOrder = currentList.sortOrder || SORT_MANUAL;

  if (sortOrder === SORT_MANUAL) {
    return;
  }

  const units = currentList.units;

  if (sortOrder === "A-Z") {
    units.sort(sortDataSheetAlphabetical);
  } else if (sortOrder === "Expensive first") {
    units.sort(sortListPoints(currentMFM.value, false));
  } else if (sortOrder === "Cheap first") {
    units.sort(sortListPoints(currentMFM.value, true));
  } else if (sortOrder === "By Role") {
    units.sort(sortListByRole(compendium.value));
  }
}

function createNewList(faction, detachment) {
  return {
    detachment: detachment || MFM.CURRENT.FACTIONS[0].detachments[0].name,
    faction: faction || MFM.CURRENT.FACTIONS[0].name,
    subFaction: null,
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

async function selectList(list) {
  const detachment = list.detachment;
  const i = appData.lists.indexOf(list);
  appData.lists.splice(i, 1);
  appData.lists.unshift(appData.currentList);
  appData.currentList = list;

  // not sure, why but changing the list of options and default value of the
  // dropdown at the same time causes the wrong value to be selected
  await new Promise((r) => requestAnimationFrame(r));
  appData.currentList.detachment = detachment;
}

function copyList(list) {
  let i;
  if (list === appData.currentList) {
    i = 0;
  } else {
    i = appData.lists.indexOf(list);
  }
  const clone = JSON.parse(JSON.stringify(list));
  appData.lists.splice(i, 0, clone);
}

function deleteList(list) {
  const i = appData.lists.indexOf(list);
  appData.lists.splice(i, 1);
}

function setSortOrder(sortOrder) {
  appData.currentList.sortOrder = sortOrder;
}

function setShowPointsChanges(value) {
  appData.showPointsChanges = value;
}

function setShowForgeWorld(value) {
  appData.showForgeWorld = value;
}

function setShowLegends(value) {
  appData.showLegends = value;
}

function setEditCollection(value) {
  appData.editCollection = value;
}

function setCodexSortOrder(value) {
  appData.sortOrder = value;
}

function setGroup(value) {
  appData.group = value;
}

function setMaxPoints(value) {
  appData.currentList.maxPoints = value;
}

function setListName(value) {
  appData.currentList.name = value;
}

function setMfmVersion(value) {
  appData.currentList.mfm_version = value;
}

function setUnits(units) {
  appData.currentList.units = units;
}

function removeUnit(value) {
  appData.bin = value;
}

function setFaction(value) {
  appData.currentList.faction = value;
}

function setSubFaction(value) {
  appData.currentList.subFaction = value;
}

function setDetachment(value) {
  appData.currentList.detachment = value;
}

function setCodexFilter(value) {
  appData.codexFilter = value;
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
    appData.currentList.subFaction = null;
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

watch(
  () => appData.currentList.subFaction,
  () => {
    const faction = factions.value.find(
      (f) =>
        f.name?.toLowerCase() === appData.currentList.faction?.toLowerCase()
    );

    if (!faction?.detachments) return;

    const currentDetachment = appData.currentList.detachment;
    const isDetachmentAvailable = faction.detachments.some(
      (d) => d.name === currentDetachment
    );

    if (!isDetachmentAvailable) {
      appData.currentList.detachment = faction.detachments[0]?.name;
    }
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
    <AppToolBar
      class="app__toolbar"
      :current-list="appData.currentList"
      :saved-lists="appData.lists"
      :current-m-f-m="currentMFM"
      :detachment-display-name="detachmentDisplayName"
      :is-boarding-actions="isBoardingActions"
      :effective-max-points="effectiveMaxPoints"
      @new-list="newList"
      @select-list="selectList"
      @copy-list="copyList"
      @delete-list="deleteList"
      @set-max-points="setMaxPoints"
      @set-list-name="setListName"
    />
    <CodexToolBar
      class="app__codex-toolbar"
      :factions="factions"
      :current-m-f-m="currentMFM"
      :current-list="appData.currentList"
      :boarding-actions="appData.boardingActions"
      :available-sub-factions="availableSubFactions"
      :codex-filter="appData.codexFilter"
      :current-list-sort-order="appData.currentList.sortOrder"
      :show-points-changes="appData.showPointsChanges"
      :show-forge-world="appData.showForgeWorld"
      :show-legends="appData.showLegends"
      :edit-collection="appData.editCollection"
      :sort-order="appData.sortOrder"
      :group="appData.group"
      @set-sort-order="setSortOrder"
      @set-show-points-changes="setShowPointsChanges"
      @set-show-forge-world="setShowForgeWorld"
      @set-show-legends="setShowLegends"
      @set-edit-collection="setEditCollection"
      @set-codex-sort-order="setCodexSortOrder"
      @set-group="setGroup"
      @set-faction="setFaction"
      @set-sub-faction="setSubFaction"
      @set-detachment="setDetachment"
      @set-codex-filter="setCodexFilter"
    />
    <div class="app__body">
      <ArmyList
        :app-height="appData.appHeight"
        :effective-max-points="effectiveMaxPoints"
        :current-m-f-m="currentMFM"
        :compendium="compendium"
        :is-boarding-actions="isBoardingActions"
        :detachment="appData.currentList.detachment"
        :current-list="appData.currentList"
        @set-units="setUnits"
        @set-sort-order="setSortOrder"
      />
      <ArmyCodex
        :filtered-compendium="filteredCompendium"
        :compendium="compendium"
        :codex-filter="appData.codexFilter"
        :show-forge-world="appData.showForgeWorld"
        :show-legends="appData.showLegends"
        :sort-order="appData.sortOrder"
        :is-boarding-actions="isBoardingActions"
        :boarding-actions-config="boardingActionsConfig"
        :current-list="appData.currentList"
        :group="appData.group"
        :edit-collection="appData.editCollection"
        :collection="appData.collection"
        :current-m-f-m="currentMFM"
        :show-points-changes="appData.showPointsChanges"
        :bin="appData.bin"
        @add="addUnit"
        @remove-unit="removeUnit"
      />
    </div>
    <VersionBar
      :current-list="appData.currentList"
      @set-mfm-version="setMfmVersion"
    />
  </div>
  <PrintableArmyList
    :current-m-f-m="currentMFM"
    :current-list="appData.currentList"
    :detachment-display-name="detachmentDisplayName"
    class="print"
  />
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
