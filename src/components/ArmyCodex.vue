<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import CodexToolBar from "./CodexToolBar.vue";
import { computed, ref } from "vue";
import {
  GROUP_NONE,
  SORT_CHEAPEST_FIRST,
  SORT_EXPENSIVE_FIRST,
} from "../data/constants";
import {
  sortDataSheetAlphabetical,
  sortDataSheetPtsAscending,
  sortDataSheetPtsDescending,
} from "../utils/sort-functions";

const props = defineProps({
  appData: Object,
});

const emit = defineEmits(["add"]);
function addUnit(unit, size) {
  emit("add", unit, size);
}

function factionFilter(sheet) {
  return sheet.faction === props.appData.currentList.faction;
}

function userFilter(sheet) {
  return sheet.name
    .toLowerCase()
    .includes(props.appData.codexFilter.toLowerCase());
}

function forgeWorldFilter(sheet) {
  if (props.appData.showForgeWorld) {
    return true;
  } else {
    return !sheet.forgeWorld;
  }
}

function sortOrder() {
  if (props.appData.sortOrder === SORT_EXPENSIVE_FIRST) {
    return sortDataSheetPtsDescending;
  }
  if (props.appData.sortOrder === SORT_CHEAPEST_FIRST) {
    return sortDataSheetPtsAscending;
  }
  return sortDataSheetAlphabetical;
}

const dataSheets = computed(() => {
  return props.appData.compendium
    ?.filter(factionFilter)
    .filter(userFilter)
    .filter(forgeWorldFilter)
    .sort(sortOrder());
});

const enhancements = computed(() => {
  const { name, sizes } = props.appData.compendium.find(
    (sheet) => sheet.name === "Enhancements"
  );

  return {
    name,
    sizes: sizes.filter(
      (s) => s.detachment === props.appData.currentList.detachment
    ),
    enhancements: true,
  };
});

const groupedUnits = computed(() => {
  const data = [];
  if (props.appData.group === GROUP_NONE) {
    data.push({ title: "", units: dataSheets.value });
  } else {
    const characters = { title: "Characters", units: [] };
    const battleLine = { title: "Battle Line", units: [] };
    const transports = { title: "Dedicated Transport", units: [] };
    const other = { title: "Other", units: [] };
    const allies = { title: "Allies", units: [] };
    const forgeWorld = { title: "Forge World", units: [] };

    data.push(characters, battleLine, transports, other, allies, forgeWorld);

    dataSheets.value.forEach((sheet) => {
      if (sheet.allies) {
        allies.title = sheet.allies;
        allies.units.push(sheet);
      } else if (sheet.character) {
        characters.units.push(sheet);
      } else if (sheet.battleLine) {
        battleLine.units.push(sheet);
      } else if (sheet.dedicatedTransport) {
        transports.units.push(sheet);
      } else if (sheet.forgeWorld) {
        forgeWorld.units.push(sheet);
      } else {
        other.units.push(sheet);
      }
    });
  }

  if (enhancements.value.sizes.length) {
    data.push({
      title: "Detachment Enhancements",
      units: [enhancements.value],
    });
  }

  return data.filter((group) => group.units.length > 0);
});

// horizontal scroll using scrollwheel
const codexEl = ref(null);
function onScrollWheel(e) {
  e.preventDefault();
  codexEl.value.scrollLeft += e.deltaY;
}
</script>

<template>
  <div class="codex">
    <!-- Draggable area for deleting units from army list -->
    <draggable
      v-model="props.appData.bin"
      group="units"
      animation="150"
      item-key="id"
      class="codex__bin"
    >
      <template #item="{ element, index }">
        <ArmyListUnit :unit="element" :index="index" :scale="scale" />
      </template>
    </draggable>
    <CodexToolBar class="codex__toolbar" :app-data="appData" />
    <div class="codex__mfm" @wheel="onScrollWheel" ref="codexEl">
      <template v-if="dataSheets.length > 0">
        <div class="codex__group" v-for="group in groupedUnits">
          <h2 class="codex__group-title" v-if="group.title">
            {{ group.title }}
          </h2>
          <div class="codex__group-units">
            <DataSheet
              v-for="(unit, index) in group.units"
              :dataSheet="unit"
              :app-data="appData"
              @add="addUnit"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="codex__no-units">
          Forge World units are hidden, you can show them in the options
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.codex {
  background-color: #fff;
  background-image: url(../assets/bg.png);
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;

  &__mfm {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
    writing-mode: vertical-lr;
  }
  &__group {
    display: flex;
    flex-direction: row;

    &-title {
      font-size: 18px;
      margin: 12px 12px 0 12px;
      text-transform: uppercase;
      writing-mode: initial;
    }
    &-units {
      align-content: flex-start;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px;
      position: relative;
    }
  }
  &__bin {
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
  }
  &__no-units {
    padding: 12px;
    writing-mode: initial;
  }
}
</style>
