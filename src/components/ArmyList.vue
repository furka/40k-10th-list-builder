<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";

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

const space = computed(() => {
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
    @start="drag = true"
    @end="drag = false"
    animation="150"
    item-key="id"
    class="army-list"
  >
    <template #item="{ element, index }">
      <ArmyListUnit :unit="element" :index="index" :scale="scale" />
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
  width: 250px;
  padding-top: v-bind("space");
}
</style>
