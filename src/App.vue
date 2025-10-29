<script setup>
import { reactive, onMounted, onUnmounted, watch, ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useArmyListStore } from "./stores/armyList";
import { useCollectionStore } from "./stores/collection";
import { useMfmStore } from "./stores/mfm";
import { useCodexStore } from "./stores/codex";
import { useAppStore } from "./stores/app";
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
import { save } from "./utils/localStorage";

const armyListStore = useArmyListStore();
const collectionStore = useCollectionStore();
const mfmStore = useMfmStore();
const codexStore = useCodexStore();
const appStore = useAppStore();

const appData = reactive({
  boardingActions: BOARDING_ACTIONS,
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
  const defaultList = appStore.createNewList();
  armyListStore.loadFromStorage(defaultList);
  collectionStore.loadFromStorage();

  const currentList = armyListStore.toObject();
  const migrationsAppData = {
    ...appData,
    currentList,
    lists: appStore.lists,
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

  // Initialize codex store with current values
  codexStore.setFaction(armyListStore.faction);
  codexStore.setSubFaction(armyListStore.subFaction);
  codexStore.setDetachment(armyListStore.detachment);
  codexStore.setCurrentMFM(armyListStore.currentMFM);

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.size) {
    try {
      const list = deserializeList(searchParams);
      appStore.lists.unshift(armyListStore.toObject());
      armyListStore.setList(list);
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
  appStore.setAppDimensions(window.innerHeight, window.innerWidth);
};

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
    units.sort(sortListByRole(codexStore.getDataSheet));
  }

  armyListStore.setUnits(units);
}

function setSortOrder(sortOrder) {
  armyListStore.sortOrder = sortOrder;
}

watch(
  () => appStore.bin,
  () => appStore.bin.splice(0)
);

watch(
  () => armyListStore.faction,
  (newFaction) => {
    appStore.codexFilter = "";
    appStore.editCollection = false;
    armyListStore.subFaction = null;
    armyListStore.detachment = mfmStore.MFM.CURRENT.FACTIONS.find(
      (f) =>
        f.name?.toLowerCase() === newFaction?.toLowerCase()
    )?.detachments[0]?.name;
    codexStore.setFaction(newFaction);
  }
);

watch(
  () => armyListStore.subFaction,
  (newSubFaction) => {
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

    codexStore.setSubFaction(newSubFaction);
  }
);

watch(
  () => armyListStore.detachment,
  (newDetachment) => {
    codexStore.setDetachment(newDetachment);
  }
);

watch(
  () => armyListStore.currentMFM,
  (newMFM) => {
    codexStore.setCurrentMFM(newMFM);
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

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="app">
    <AppToolBar class="app__toolbar" />
    <CodexToolBar class="app__codex-toolbar" />
    <div class="app__body">
      <ArmyList />
      <ArmyCodex />
    </div>
    <VersionBar />
  </div>
  <PrintableArmyList class="print" />
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
