<script setup>
import { reactive, onMounted, onUnmounted, watch, ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useArmyListStore } from "./stores/armyList";
import { useCollectionStore } from "./stores/collection";
import { useMfmStore } from "./stores/mfm";
import { useCodexStore } from "./stores/codex";
import ArmyList from "./components/ArmyList.vue";
import ArmyCodex from "./components/ArmyCodex.vue";
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
import { save, restore } from "./utils/localStorage";

const armyListStore = useArmyListStore();
const collectionStore = useCollectionStore();
const mfmStore = useMfmStore();
const codexStore = useCodexStore();

const appData = reactive({
  appHeight: window.innerHeight,
  appWidth: window.innerWidth,
  armyName: "",
  bin: [],
  boardingActions: BOARDING_ACTIONS,
  codexFilter: "",
  editCollection: false,
  group: restore("group") ?? GROUP_NONE,
  lists: restore("lists") ?? [],
  showForgeWorld: restore("showForgeWorld") ?? false,
  showLegends: restore("showLegends") ?? false,
  showPointsChanges: restore("showPointsChanges") ?? true,
  sortOrder: restore("sortOrder") ?? "A-Z",
  units: restore("units") ?? [],
});


const factions = computed(() => {
  const baseFactions = (armyListStore.currentMFM || mfmStore.MFM.CURRENT).FACTIONS;

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
      faction.name === armyListStore.faction &&
      armyListStore.subFaction
    ) {
      const subFaction = baseFactions.find(
        (f) => f.name === armyListStore.subFaction
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

const boardingActionsConfig = computed(() => {
  if (!armyListStore.isBoardingActions) {
    return null;
  }
  return appData.boardingActions[armyListStore.faction]?.[
    armyListStore.detachment
  ];
});

const detachmentDisplayName = computed(() => {
  const detachment = armyListStore.detachment;
  if (!detachment) return "";
  const config =
    appData.boardingActions[armyListStore.faction]?.[detachment];
  return config?.displayName || detachment;
});

const availableSubFactions = computed(() => {
  const currentFaction = armyListStore.faction;
  if (!currentFaction) return [];

  return Object.keys(CONFIGS["sub-factions"]).filter((factionName) => {
    return CONFIGS["sub-factions"][factionName] === currentFaction;
  });
});

console.log(appData);

function initializeApp() {
  const defaultList = createNewList();
  armyListStore.loadFromStorage(defaultList);
  collectionStore.loadFromStorage();

  const currentList = armyListStore.toObject();
  const migrationsAppData = {
    ...appData,
    currentList,
    collection: collectionStore.collection
  };

  runAllMigrations(migrationsAppData, (key, val = migrationsAppData[key]) => {
    if (key === 'collection') {
      collectionStore.setCollection(val);
    } else {
      save(key, val);
    }
  });

  armyListStore.setList(migrationsAppData.currentList);

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.size) {
    try {
      const list = deserializeList(searchParams);
      appData.lists.unshift(armyListStore.toObject());
      armyListStore.setList(list);
      save("lists", appData.lists);
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
}

initializeApp();

const handleResize = () => {
  appData.appHeight = window.innerHeight;
  appData.appWidth = window.innerWidth;
};

function addUnit(unit, size) {
  const newUnit = {
    id: uuidv4(),
    bonus: size.bonus,
    models: size.models,
    name: unit.name,
    optionName: size.name,
  };
  armyListStore.addUnit(newUnit);
}

function applySortToList() {
  const sortOrder = armyListStore.sortOrder || SORT_MANUAL;

  if (sortOrder === SORT_MANUAL) {
    return;
  }

  const units = [...armyListStore.units];

  if (sortOrder === "A-Z") {
    units.sort(sortDataSheetAlphabetical);
  } else if (sortOrder === "Expensive first") {
    units.sort(sortListPoints(mfmStore, armyListStore.currentMFM, false));
  } else if (sortOrder === "Cheap first") {
    units.sort(sortListPoints(mfmStore, armyListStore.currentMFM, true));
  } else if (sortOrder === "By Role") {
    units.sort(sortListByRole(codexStore.compendium));
  }

  armyListStore.setUnits(units);
}

function createNewList(faction, detachment) {
  return {
    detachment: detachment || mfmStore.MFM.CURRENT.FACTIONS[0].detachments[0].name,
    faction: faction || mfmStore.MFM.CURRENT.FACTIONS[0].name,
    subFaction: null,
    maxPoints: 2000,
    mfm_version: mfmStore.MFM.CURRENT.MFM_VERSION,
    modifiedDate: Date.now(),
    name: "",
    sortOrder: SORT_MANUAL,
    units: [],
    version: PACKAGE.version,
  };
}

function newList() {
  const faction = armyListStore.faction;
  const detachment = armyListStore.detachment;
  appData.lists.unshift(armyListStore.toObject());
  const newListData = createNewList(faction, detachment);
  armyListStore.setList(newListData);
}

async function selectList(list) {
  const detachment = list.detachment;
  const i = appData.lists.indexOf(list);
  appData.lists.splice(i, 1);
  appData.lists.unshift(armyListStore.toObject());
  armyListStore.setList(list);

  // not sure, why but changing the list of options and default value of the
  // dropdown at the same time causes the wrong value to be selected
  await new Promise((r) => requestAnimationFrame(r));
  armyListStore.detachment = detachment;
}

function copyList(list) {
  const currentList = armyListStore.toObject();
  let i;
  if (JSON.stringify(list) === JSON.stringify(currentList)) {
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
  armyListStore.sortOrder = sortOrder;
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
  armyListStore.maxPoints = value;
}

function setListName(value) {
  armyListStore.name = value;
}

function setMfmVersion(value) {
  armyListStore.mfm_version = value;
}

function setUnits(units) {
  armyListStore.setUnits(units);
}

function removeUnit(value) {
  appData.bin = value;
}

function setFaction(value) {
  armyListStore.faction = value;
}

function setSubFaction(value) {
  armyListStore.subFaction = value;
}

function setDetachment(value) {
  armyListStore.detachment = value;
}

function setCodexFilter(value) {
  appData.codexFilter = value;
}

function track(val) {
  watch(
    () => appData[val],
    () => save(val, appData[val]),
    { deep: true }
  );
}

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
  () => armyListStore.faction,
  () => {
    appData.codexFilter = "";
    appData.editCollection = false;
    armyListStore.subFaction = null;
    armyListStore.detachment = mfmStore.MFM.CURRENT.FACTIONS.find(
      (f) =>
        f.name?.toLowerCase() === armyListStore.faction?.toLowerCase()
    )?.detachments[0]?.name;
  }
);

watch(
  () => armyListStore.units.length,
  () => applySortToList()
);

watch(
  () => armyListStore.sortOrder,
  () => applySortToList()
);

watch(
  () => armyListStore.subFaction,
  () => {
    const faction = factions.value.find(
      (f) =>
        f.name?.toLowerCase() === armyListStore.faction?.toLowerCase()
    );

    if (!faction?.detachments) return;

    const currentDetachment = armyListStore.detachment;
    const isDetachmentAvailable = faction.detachments.some(
      (d) => d.name === currentDetachment
    );

    if (!isDetachmentAvailable) {
      armyListStore.detachment = faction.detachments[0]?.name;
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
      :saved-lists="appData.lists"
      :detachment-display-name="detachmentDisplayName"
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
      :boarding-actions="appData.boardingActions"
      :available-sub-factions="availableSubFactions"
      :codex-filter="appData.codexFilter"
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
        :effective-max-points="armyListStore.effectiveMaxPoints"
        @set-units="setUnits"
        @set-sort-order="setSortOrder"
      />
      <ArmyCodex
        :codex-filter="appData.codexFilter"
        :show-forge-world="appData.showForgeWorld"
        :show-legends="appData.showLegends"
        :sort-order="appData.sortOrder"
        :boarding-actions-config="boardingActionsConfig"
        :group="appData.group"
        :edit-collection="appData.editCollection"
        :show-points-changes="appData.showPointsChanges"
        :bin="appData.bin"
        @add="addUnit"
        @remove-unit="removeUnit"
      />
    </div>
    <VersionBar
      @set-mfm-version="setMfmVersion"
    />
  </div>
  <PrintableArmyList
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
