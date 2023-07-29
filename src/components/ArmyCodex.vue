<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { computed, ref } from "vue";

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
  if (props.appData.sortOrder === 'points max') {
    return dataSheetSortPointsMax
  }
  if (props.appData.sortOrder === 'points min') {
    return dataSheetSortPointsMin
  }
  return dataSheetSortName
}


function dataSheetSortName(a, b) {
  const aa = a.name.toLowerCase();
  const bb = b.name.toLowerCase();
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}

function dataSheetSortPointsMax(a, b) {
  const maxa = listPointsMax(a.sizes)
  const maxb = listPointsMax(b.sizes)
  return maxa < maxb ? -1 : maxa > maxb ? 1 : 0;
}

function dataSheetSortPointsMin(a, b) {
  const mina = listPointsMin(a.sizes)
  const minb = listPointsMin(b.sizes)
  return mina < minb ? -1 : mina > minb ? 1 : 0;
}

function listPointsMax(sizes){
  var max = 0
  var bonus = 0
  sizes.forEach(s => {
    if (s.bonus) {
      bonus += s.points
    } else {
      if (s.points > max) {
        max = s.points
      }
    }
  });
  return max+bonus

}

function listPointsMin(sizes){
  var min = 9999
  sizes.forEach(s => {
    if (!s.bonus && s.points < min) {
        min = s.points
      }
  });
  return min

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
  <div class="codex" @wheel="onScrollWheel" ref="codexEl">
    <draggable v-model="props.appData.bin" group="units" animation="150" item-key="id" class="codex__bin">
      <template #item="{ element, index }">
        <ArmyListUnit :unit="element" :index="index" :scale="scale" />
      </template>
    </draggable>

    <DataSheet v-for="(unit, index) in dataSheets" :dataSheet="unit" :app-data="appData" @add="addUnit" />

    <DataSheet v-if="enhancements" :dataSheet="enhancements" :app-data="appData" @add="addUnit" />
  </div>
</template>

<style scoped lang="scss">
.codex {
  align-content: flex-start;
  background-color: #fff;
  background-image: url(../assets/bg.png);
  background-size: 100% 100%;
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
</style>
