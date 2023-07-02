<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { computed, ref } from "vue";

const props = defineProps({
  appData: Object,
});

const emit = defineEmits(["add"]);
function addUnit(unit, size) {
  emit("add", unit, size);
}

const codex = computed(() => {
  return props.appData.compendium.find(
    (faction) => faction.name === props.appData.faction
  );
});

const dataSheets = computed(() => {
  return codex.value?.["data-sheets"]
    ?.filter((sheet) =>
      sheet.name.toLowerCase().includes(props.appData.codexFilter.toLowerCase())
    )
    .sort((a, b) => {
      const aa = a.name.toLowerCase();
      const bb = b.name.toLowerCase();
      return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
});

const enhancements = computed(() => {
  return codex.value.detachments?.find(
    (d) => d.name === props.appData.detachment
  )?.enhancements;
});

const codexEl = ref(null);

function onScrollWheel(e) {
  e.preventDefault();
  codexEl.value.scrollLeft += e.deltaY;
}
</script>

<template>
  <div class="codex" @wheel="onScrollWheel" ref="codexEl">
    <draggable
      v-model="props.appData.bin"
      group="units"
      @start="drag = true"
      @end="drag = false"
      animation="150"
      item-key="id"
      class="codex__bin"
    >
      <template #item="{ element, index }">
        <ArmyListUnit :unit="element" :index="index" :scale="scale" />
      </template>
    </draggable>

    <DataSheet
      v-for="(unit, index) in dataSheets"
      :dataSheet="unit"
      :app-data="appData"
      @add="addUnit"
    />

    <DataSheet
      v-if="enhancements"
      :dataSheet="enhancements"
      :app-data="appData"
      @add="addUnit"
    />
  </div>
</template>

<style scoped lang="scss">
.codex {
  align-content: flex-start;
  background-color: #fff;
  background-image: url(../assets/bg.png);
  background-size: 100% 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 12px;
  position: relative;
  writing-mode: vertical-lr;

  &__bin {
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
