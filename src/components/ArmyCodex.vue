<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";

const props = defineProps({
  appData: Object,
});

const emit = defineEmits(["add"]);
function addUnit(unit, size) {
  emit("add", unit, size);
}
</script>

<template>
  <div class="codex">
    <draggable
      v-model="props.appData.bin"
      group="units"
      @start="drag = true"
      @end="drag = false"
      animation="150"
      item-key="id"
      class="bin"
    >
      <template #item="{ element, index }">
        <ArmyListUnit :unit="element" :index="index" :scale="scale" />
      </template>
    </draggable>

    <DataSheet
      v-for="(unit, index) in props.appData.codex['data-sheets']"
      :dataSheet="unit"
      :app-data="appData"
      @add="addUnit"
    />
  </div>
</template>

<style scoped>
.codex {
  align-content: flex-start;
  background-color: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 100vh;
  padding: 12px;
  writing-mode: vertical-lr;
  position: relative;
}
.bin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
</style>
