<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import CodexToolBar from "./CodexToolBar.vue";
import { computed, ref } from "vue";
import { SORT_CHEAPEST_FIRST, SORT_EXPENSIVE_FIRST } from "../data/constants";
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
  return props.appData.compendium.find(
    (sheet) => sheet.name === "Enhancements"
  );
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
    <CodexToolBar class="codex__toolbar" :app-data="appData" />
    <div class="codex__mfm" @wheel="onScrollWheel" ref="codexEl">
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

      <DataSheet
        v-for="(unit, index) in dataSheets"
        :dataSheet="unit"
        :app-data="appData"
        @add="addUnit"
      />

      <DataSheet
        v-if="enhancements"
        :dataSheet="enhancements"
        :app-data="appData"
        @add="addUnit"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.codex {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #fff;
  background-image: url(../assets/bg.png);
  background-size: 100% 100%;
  overflow-x: auto;
  overflow-y: hidden;

  &__mfm {
    align-content: flex-start;
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    gap: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 12px;
    position: relative;
    writing-mode: vertical-lr;

    &__bin {
      bottom: 0;
      left: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}
</style>
