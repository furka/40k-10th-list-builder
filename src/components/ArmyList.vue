<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";

const props = defineProps({
  appData: Object,
});

// scale the army list based on the current viewport
//compensate for set height of toolbar (88) and sortbox (44)
const scale = computed(() => {
  return (props.appData.appHeight - 132) / props.appData.currentList.maxPoints;
});

//constrain the height of the army list box so we can't flex off the bottom
const listHeight = computed(() => {
  return (props.appData.appHeight - 132) + "px"
});

// sort functions
function sortName(a, b) {
  const aa = a.name.toLowerCase();
  const bb = b.name.toLowerCase();
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}

function sortPoints(a, b) {
  return a.points < b.points ? 1 : a.points > b.points ? -1 : 0;
}
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

  &-army-list {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    margin-top: auto;
    max-width: calc(100vw - 300px);
    width: 250px;
    height: v-bind("listHeight")
  }

  &-sort-box {
    background-color: #333;
    color: white;
    height: 44px;
    display: flex;
    flex-direction: column;
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
