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
  <div class="army-list">
    <div class="army-list__points">
      <span>{{ points }}</span> /
      <input
        type="number"
        min="500"
        step="500"
        v-model.number="props.appData.maxPoints"
      />
    </div>

    <draggable
      v-model="props.appData.units"
      group="units"
      @start="drag = true"
      @end="drag = false"
      animation="150"
      item-key="id"
      class="army-list__units"
    >
      <template #item="{ element, index }">
        <ArmyListUnit :unit="element" :index="index" :scale="scale" />
      </template>
    </draggable>
  </div>
</template>

<style scoped>
.army-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 250px;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: space-between;
  overflow: hidden;
}
.army-list__points {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 60px;
  justify-content: center;
  border-bottom: 2px solid #fff;
}
.army-list__units {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
  justify-content: flex-end;
}
input {
  width: 5em;
}
</style>
