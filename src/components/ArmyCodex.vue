<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { computed, ref } from "vue";
import { useArmyListStore } from "../stores/armyList";
import { useCollectionStore } from "../stores/collection";
import { useCodexStore } from "../stores/codex";
import { useAppStore } from "../stores/app";
import { GROUP_NONE } from "../data/constants";
import { isBattleLine } from "../utils/is-battleline";
import { getBoardingActionsDisplayName } from "../utils/boarding-actions";

const armyListStore = useArmyListStore();
const collectionStore = useCollectionStore();
const codexStore = useCodexStore();
const appStore = useAppStore();

const groupedUnits = computed(() => {
  const data = [];
  if (appStore.group === GROUP_NONE) {
    data.push({ title: "", units: codexStore.filteredCompendium });
  } else {
    const characters = { title: "Characters", units: [] };
    const battleLine = { title: "Battle Line", units: [] };
    const transports = { title: "Dedicated Transport", units: [] };
    const other = { title: "Other", units: [] };
    const allies = { title: "Allies", units: [] };
    const forgeWorld = { title: "Forge World", units: [] };
    const fortifications = { title: "Fortifications", units: [] };

    data.push(
      characters,
      battleLine,
      transports,
      other,
      allies,
      forgeWorld,
      fortifications
    );

    codexStore.filteredCompendium.forEach((sheet) => {
      if (sheet.allies) {
        allies.title = sheet.allies;
        allies.units.push(sheet);
      } else if (sheet.character) {
        characters.units.push(sheet);
      } else if (isBattleLine(sheet)) {
        battleLine.units.push(sheet);
      } else if (sheet.dedicatedTransport) {
        transports.units.push(sheet);
      } else if (sheet.forgeWorld) {
        forgeWorld.units.push(sheet);
      } else if (sheet.fortification) {
        fortifications.units.push(sheet);
      } else {
        other.units.push(sheet);
      }
    });
  }

  if (codexStore.enhancements.sizes.length) {
    const detachmentDisplayName = getBoardingActionsDisplayName(armyListStore.detachment).toLowerCase();
    const groupedEnhancements = {};

    codexStore.enhancements.sizes.forEach((enhancement) => {
      const category = enhancement.enhancementCategory || detachmentDisplayName;
      if (!groupedEnhancements[category]) {
        groupedEnhancements[category] = [];
      }
      groupedEnhancements[category].push(enhancement);
    });

    const enhancementUnits = Object.entries(groupedEnhancements).map(([category, sizes]) => ({
      name: category,
      displayName: category,
      sizes,
      enhancements: true,
    }));

    if (enhancementUnits.length) {
      data.push({
        title: "Enhancements",
        units: enhancementUnits,
      });
    }
  }

  return data.filter((group) => group.units.length > 0);
});

function removeUnit(value) {
  appStore.bin = value;
}

// horizontal scroll using scrollwheel
const codexEl = ref(null);
function onScrollWheel(e) {
  e.preventDefault();
  codexEl.value.scrollLeft += e.deltaY;
}
</script>

<template>
  <div class="codex">
    <!-- Draggable area for deleting units from army list -->
    <draggable
      :model-value="appStore.bin"
      @update:model-value="removeUnit"
      group="units"
      animation="150"
      item-key="id"
      class="codex__bin"
    >
      <template #item="{ element, index }">
        <ArmyListUnit :unit="element" :index="index" :scale="scale" />
      </template>
    </draggable>
    <div class="codex__mfm" @wheel="onScrollWheel" ref="codexEl">
      <template v-if="codexStore.filteredCompendium.length > 0">
        <div class="codex__group" v-for="group in groupedUnits">
          <h2 class="codex__group-title" v-if="group.title">
            {{ group.title }}
          </h2>
          <div class="codex__group-units">
            <DataSheet
              v-for="(unit, index) in group.units"
              :key="unit.name"
              :dataSheet="unit"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="codex__no-units">
          Forge World units are hidden, you can show them in the options
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.codex {
  background-color: #fff;
  background-image: url(../assets/bg.png);
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;

  &__mfm {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
    writing-mode: vertical-lr;
  }
  &__group {
    display: flex;
    flex-direction: row;

    &-title {
      font-size: 18px;
      margin: 12px 12px 0 12px;
      text-transform: uppercase;
      writing-mode: initial;
    }
    &-units {
      align-content: flex-start;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px;
      position: relative;
    }
  }
  &__bin {
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
  }
  &__no-units {
    padding: 12px;
    writing-mode: initial;
  }
}
</style>
