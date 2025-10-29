<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { SORT_MANUAL } from "../data/constants";
import { useArmyListStore } from "../stores/armyList";
import { useMfmStore } from "../stores/mfm";
import { useCodexStore } from "../stores/codex";
import { useAppStore } from "../stores/app";

const armyListStore = useArmyListStore();
const mfmStore = useMfmStore();
const codexStore = useCodexStore();
const appStore = useAppStore();

const TOOLBAR_HEIGHT = 44;
const VERSION_BAR_HEIGHT = 20;

const scale = computed(() => {
  return (appStore.appHeight - (TOOLBAR_HEIGHT * 2) - VERSION_BAR_HEIGHT) / armyListStore.effectiveMaxPoints;
});

const points = computed(() => {
  return armyListStore.units.reduce(
    (acc, curr) => {
      const unitPoints = mfmStore.getPoints(curr, armyListStore.currentMFM);
      return acc + (unitPoints > 0 ? unitPoints : 0);
    },
    0
  );
});

const emptySpace = computed(() => {
  return (
    Math.max(0, armyListStore.effectiveMaxPoints - points.value) *
      scale.value +
    "px"
  );
});

function handleDragChange(event) {
  if (event.moved) {
    armyListStore.sortOrder = SORT_MANUAL;
  }
}

function updateUnits(units) {
  armyListStore.setUnits(units);
}
</script>

<template>
  <draggable
    :model-value="armyListStore.units"
    @update:model-value="updateUnits"
    group="units"
    animation="150"
    item-key="id"
    class="army-list"
    @change="handleDragChange"
  >
    <template #item="{ element, index }">
      <ArmyListUnit
        :unit="element"
        :scale="scale"
      />
    </template>
  </draggable>
</template>

<style scoped lang="scss">
.army-list {
  background-image: url(../assets/bg-dark.png);
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: flex-end;
  padding-top: v-bind("emptySpace");
  width: 250px;
}
</style>
