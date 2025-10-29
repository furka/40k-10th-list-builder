<script setup>
import DataSheet from "./DataSheet.vue";
import draggable from "vuedraggable";
import ArmyListUnit from "./ArmyListUnit.vue";
import { computed, ref } from "vue";
import { useArmyListStore } from "../stores/armyList";
import { useCollectionStore } from "../stores/collection";
import { useCodexStore } from "../stores/codex";
import {
  GROUP_NONE,
  SORT_CHEAPEST_FIRST,
  SORT_EXPENSIVE_FIRST,
} from "../data/constants";
import {
  sortDataSheetAlphabetical,
  sortDataSheetPtsAscending,
  sortDataSheetPtsDescending,
} from "../utils/sort-functions";
import { isBattleLine } from "../utils/is-battleline";
import { getBoardingActionsDisplayName } from "../utils/boarding-actions";

const armyListStore = useArmyListStore();
const collectionStore = useCollectionStore();
const codexStore = useCodexStore();

const props = defineProps({
  codexFilter: String,
  showForgeWorld: Boolean,
  showLegends: Boolean,
  sortOrder: String,
  boardingActionsConfig: Object,
  group: String,
  editCollection: Boolean,
  showPointsChanges: Boolean,
  bin: Array,
});

const emit = defineEmits(["add", "remove-unit"]);

function addUnit(unit, size) {
  emit("add", unit, size);
}

function userFilter(sheet) {
  return sheet.name
    .toLowerCase()
    .includes(props.codexFilter.toLowerCase());
}

function forgeWorldFilter(sheet) {
  if (props.showForgeWorld) {
    return true;
  } else {
    return !sheet.forgeWorld;
  }
}

function legendsFilter(sheet) {
  if (props.showLegends) {
    return true;
  } else {
    return !sheet.legends;
  }
}

function sortOrderFn() {
  if (props.sortOrder === SORT_EXPENSIVE_FIRST) {
    return sortDataSheetPtsDescending;
  }
  if (props.sortOrder === SORT_CHEAPEST_FIRST) {
    return sortDataSheetPtsAscending;
  }
  return sortDataSheetAlphabetical;
}

function applyBoardingActionsRules(sheets) {
  if (!armyListStore.isBoardingActions) {
    return sheets;
  }

  const config = props.boardingActionsConfig;
  if (!config?.units) {
    return [];
  }

  // Build a lookup map once instead of flatMapping for every sheet
  const unitConfigMap = new Map();
  config.units.forEach(slot => {
    slot.options.forEach(option => {
      unitConfigMap.set(option.name.toLowerCase(), option);
    });
  });

  return sheets
    .map(sheet => {
      const unitConfig = unitConfigMap.get(sheet.name.toLowerCase());

      if (!unitConfig) {
        return null;
      }

      if (!unitConfig.models) {
        return sheet;
      }

      const filteredSizes = sheet.sizes.filter(size =>
        unitConfig.models.includes(size.models)
      );

      return {
        ...sheet,
        sizes: filteredSizes.length > 0 ? filteredSizes : sheet.sizes
      };
    })
    .filter(sheet => sheet !== null);
}

const dataSheets = computed(() => {
  const sheets = codexStore.filteredCompendium
    ?.filter(userFilter)
    .filter(forgeWorldFilter)
    .filter(legendsFilter)
    .sort(sortOrderFn());

  return applyBoardingActionsRules(sheets || []);
});


const unitStats = computed(() => {
  return {
    counts: armyListStore.unitCounts,
    modelsTaken: armyListStore.modelsTaken,
    enhancementsTaken: armyListStore.enhancementsTaken,
  };
});

const groupedUnits = computed(() => {
  const data = [];
  if (props.group === GROUP_NONE) {
    data.push({ title: "", units: dataSheets.value });
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

    dataSheets.value.forEach((sheet) => {
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
    // Group enhancements by category
    const detachmentEnhancements = codexStore.enhancements.sizes.filter(
      s => !s.enhancementCategory
    );
    const genericEnhancements = codexStore.enhancements.sizes.filter(
      s => s.enhancementCategory === "Generic Enhancements"
    );
    const breachingEnhancements = codexStore.enhancements.sizes.filter(
      s => s.enhancementCategory === "Breaching Operation Enhancements"
    );

    const enhancementUnits = [];
    const detachmentDisplayName = getBoardingActionsDisplayName(armyListStore.detachment).toLowerCase();

    if (detachmentEnhancements.length) {
      enhancementUnits.push({
        name: "Detachment Enhancements",
        displayName: detachmentDisplayName,
        sizes: detachmentEnhancements,
        enhancements: true,
      });
    }

    if (genericEnhancements.length) {
      enhancementUnits.push({
        name: "Generic Enhancements",
        displayName: "boarding actions",
        sizes: genericEnhancements,
        enhancements: true,
      });
    }

    if (breachingEnhancements.length) {
      enhancementUnits.push({
        name: "Breaching Operation Enhancements",
        displayName: "breaching operations",
        sizes: breachingEnhancements,
        enhancements: true,
      });
    }

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
  emit("remove-unit", value);
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
      :model-value="props.bin"
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
      <template v-if="dataSheets.length > 0">
        <div class="codex__group" v-for="group in groupedUnits">
          <h2 class="codex__group-title" v-if="group.title">
            {{ group.title }}
          </h2>
          <div class="codex__group-units">
            <DataSheet
              v-for="(unit, index) in group.units"
              :key="unit.name"
              :dataSheet="unit"
              :unit-stats="unitStats"
              :edit-collection="props.editCollection"
              :sort-order="props.sortOrder"
              :compendium="codexStore.compendium"
              :show-points-changes="props.showPointsChanges"
              :group="props.group"
              @add="addUnit"
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
