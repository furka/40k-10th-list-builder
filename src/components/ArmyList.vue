<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";

const props = defineProps({
  appData: Object,
});

const scale = computed(() => {
  return (props.appData.appHeight - 62) / props.appData.maxPoints;
});
const points = computed(() => {
  return props.appData.units.reduce((acc, curr) => acc + curr.points, 0);
});
</script>

<template>
  <draggable
    v-model="props.appData.units"
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
  overflow: hidden;
  width: 250px;
}
</style>
