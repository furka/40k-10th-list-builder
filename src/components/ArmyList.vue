<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";

const props = defineProps({
  appData: Object,
});

// scale the army list based on the current viewport
const scale = computed(() => {
  return (props.appData.appHeight - 62) / props.appData.currentList.maxPoints;
});

const points = computed(() => {
  return props.appData.currentList.units.reduce(
    (acc, curr) => acc + curr.points,
    0
  );
});

const emptySpace = computed(() => {
  return (
    Math.max(0, props.appData.currentList.maxPoints - points.value) *
    scale.value +
    "px"
  );
});

// sort functions
function sortName(a, b) {
  const aa = a.name.toLowerCase();
  const bb = b.name.toLowerCase();
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}

function sortPoints(a, b) {
  return a.points < b.points ? 1 : a.points > b.points ? -1 : 0;
}[]
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-sort-box">
      <div class="sidebar-sort-label">Sort By:</div>
      <span class="sidebar-sort-buttons">
        <button @click="props.appData.currentList.units.sort(sortPoints)">Points Max</button>
        <button @click="props.appData.currentList.units.sort(sortPoints).reverse()">Points Min</button>
        <button @click="props.appData.currentList.units.sort(sortName)">Name</button>
      </span>
    </div>
    <draggable v-model="props.appData.currentList.units" group="units" animation="150" item-key="id"
      class="sidebar-army-list">
      <template #item="{ element }">
        <ArmyListUnit :unit="element" :scale="scale" :app-data="props.appData" />
      </template>
    </draggable>
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  width: 250px;
  background-image: url(../assets/bg-dark.png);
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;


  &-army-list {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    justify-content: flex-end;
    max-width: calc(100vw - 300px);
    padding-top: v-bind("emptySpace");
  }

  &-sort-box {
    background-color: #333;
    color: white;
  }

  &-sort-buttons {
    display: flex;
    justify-content: space-around;
  }


  &-sort-label {
    display: flex;
    justify-content: space-evenly;
    background-color: #333;
    color: white;
  }
}
</style>
