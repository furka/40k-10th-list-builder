<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { SORT_MANUAL } from "../data/constants";

const props = defineProps({
  appData: Object,
});

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

function handleDragChange(event) {
  if (event.moved) {
    props.appData.sortOrder = SORT_MANUAL;
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
      <ArmyListUnit :unit="element" :scale="scale" :app-data="props.appData" />
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
