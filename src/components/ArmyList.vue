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
</script>

<template>
  <draggable
    v-model="props.appData.currentList.units"
    group="units"
    animation="150"
    item-key="id"
    class="army-list"
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
  max-width: calc(100vw - 300px);
  padding-top: v-bind("emptySpace");
  width: 250px;
}
</style>
