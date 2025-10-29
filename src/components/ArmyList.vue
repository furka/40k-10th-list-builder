<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { SORT_MANUAL } from "../data/constants";
import { getPoints } from "../utils/mfm";

const TOOLBAR_HEIGHT = 44;
const VERSION_BAR_HEIGHT = 20;

const props = defineProps({
  appData: Object,
});

const scale = computed(() => {
  return (props.appData.appHeight - (TOOLBAR_HEIGHT * 2) - VERSION_BAR_HEIGHT) / props.appData.effectiveMaxPoints;
});

const points = computed(() => {
  return props.appData.currentList.units.reduce(
    (acc, curr) => {
      const unitPoints = getPoints(curr, props.appData.currentMFM);
      return acc + (unitPoints > 0 ? unitPoints : 0);
    },
    0
  );
});

const emptySpace = computed(() => {
  return (
    Math.max(0, props.appData.effectiveMaxPoints - points.value) *
      scale.value +
    "px"
  );
});

const unitCounts = computed(() => {
  const counts = {};
  props.appData.currentList.units.forEach((unit) => {
    counts[unit.name] = (counts[unit.name] || 0) + 1;
  });
  return counts;
});

function handleDragChange(event) {
  if (event.moved) {
    props.appData.currentList.sortOrder = SORT_MANUAL;
  }
}
</script>

<template>
  <draggable
    v-model="props.appData.currentList.units"
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
        :current-m-f-m="props.appData.currentMFM"
        :compendium="props.appData.compendium"
        :is-boarding-actions="props.appData.isBoardingActions"
        :detachment="props.appData.currentList.detachment"
        :current-list="props.appData.currentList"
        :unit-count="unitCounts[element.name] || 0"
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
