<script setup>
import { computed } from "vue";
import CodexOptions from "./CodexOptions.vue";
import SortArmyButton from "./SortArmyButton.vue";
import ToolBar from "./ToolBar.vue";
import { CONFIGS, BOARDING_ACTIONS } from "../data/configs";
import { useArmyListStore } from "../stores/armyList";
import { useMfmStore } from "../stores/mfm";
import { useAppStore } from "../stores/app";

const armyListStore = useArmyListStore();
const mfmStore = useMfmStore();
const appStore = useAppStore();

const factions = computed(() => {
  const baseFactions = (armyListStore.currentMFM || mfmStore.MFM.CURRENT).FACTIONS;

  return baseFactions.map((faction) => {
    let detachments = [...faction.detachments];

    const baConfig = BOARDING_ACTIONS[faction.name];
    if (baConfig) {
      const baDetachments = Object.keys(baConfig).map((detachmentName) => ({
        name: detachmentName,
        boardingActions: true,
      }));
      detachments = [...detachments, ...baDetachments];
    }

    const subFactionConfig = CONFIGS["sub-factions"];
    const subFactions = Object.keys(subFactionConfig).filter(
      (subFactionName) => subFactionConfig[subFactionName] === faction.name
    );

    if (subFactions.length > 0) {
      for (const subFactionName of subFactions) {
        const subFaction = baseFactions.find((f) => f.name === subFactionName);
        if (subFaction) {
          detachments = [...detachments, ...subFaction.detachments];
        }
      }
    }

    return {
      ...faction,
      detachments,
    };
  });
});

const availableSubFactions = computed(() => {
  const currentFaction = armyListStore.faction;
  if (!currentFaction) return [];

  return Object.keys(CONFIGS["sub-factions"]).filter((factionName) => {
    return CONFIGS["sub-factions"][factionName] === currentFaction;
  });
});

const factionsFiltered = computed(() => {
  const factionNames = factions.value
    .map((f) => f.name)
    .filter((factionName) => {
      return !CONFIGS["sub-factions"][factionName];
    });
  factionNames.sort();
  return factionNames;
});

const detachments = computed(() => {
  const faction = factions.value.find(
    (f) =>
      f.name?.toUpperCase() === armyListStore.faction?.toUpperCase()
  );

  if (!faction?.detachments) return null;

  const baseFactions = armyListStore.currentMFM?.FACTIONS || [];
  const baseFaction = baseFactions.find(
    (f) => f.name === armyListStore.faction
  );
  const baseDetachmentNames = baseFaction?.detachments.map((d) => d.name) || [];

  const standardDetachments = faction.detachments
    .filter((d) => !d.boardingActions && baseDetachmentNames.includes(d.name))
    .map((d) => d.name);

  const subFactionDetachments = faction.detachments
    .filter((d) => !d.boardingActions && !baseDetachmentNames.includes(d.name))
    .map((d) => d.name);

  const boardingActionsDetachments = faction.detachments
    .filter((d) => d.boardingActions)
    .map((d) => d.name);

  return {
    standard: standardDetachments,
    subFaction: subFactionDetachments,
    boardingActions: boardingActionsDetachments,
  };
});

function getDetachmentDisplayName(detachmentName) {
  const config = BOARDING_ACTIONS[armyListStore.faction]?.[detachmentName];
  return config?.displayName || detachmentName;
}
</script>

<template>
  <ToolBar class="codex-toolbar">
    <div class="toolbar__group toolbar__group--sort">
      <SortArmyButton />
    </div>

    <div class="toolbar__group toolbar__group--faction">
      <select
        :value="armyListStore.faction"
        @change="armyListStore.faction = $event.target.value"
        class="toolbar__faction-select"
        :class="
          availableSubFactions.length > 0
            ? 'toolbar__faction-select--3'
            : 'toolbar__faction-select--2'
        "
      >
        <option v-for="(faction, index) in factionsFiltered" :value="faction">
          {{ faction.toLowerCase() }}
        </option>
      </select>
      <template v-if="availableSubFactions.length > 0">
        <span>—</span>
        <select
          :value="armyListStore.subFaction"
          @change="armyListStore.subFaction = $event.target.value === 'null' ? null : $event.target.value"
          class="toolbar__subfaction-select toolbar__subfaction-select--3"
        >
          <option :value="null">none</option>
          <option
            v-for="(subFaction, index) in availableSubFactions"
            :key="index"
            :value="subFaction"
          >
            {{ subFaction.toLowerCase() }}
          </option>
        </select>
      </template>
      <template
        v-if="
          detachments &&
          (detachments.standard.length > 0 ||
            detachments.boardingActions.length > 0)
        "
      >
        <span>—</span>
        <select
          :value="armyListStore.detachment"
          @change="armyListStore.detachment = $event.target.value"
          class="toolbar__detachment-select"
          :class="
            availableSubFactions.length > 0
              ? 'toolbar__detachment-select--3'
              : 'toolbar__detachment-select--2'
          "
        >
          <option
            v-for="(detachment, index) in detachments.standard"
            :key="'standard-' + index"
            :value="detachment"
          >
            {{ detachment.toLowerCase() }}
          </option>
          <option
            v-if="detachments.subFaction.length > 0"
            disabled
            class="toolbar__detachment-separator"
          >
            {{ armyListStore.subFaction }}
          </option>
          <option
            v-for="(detachment, index) in detachments.subFaction"
            :key="'subfaction-' + index"
            :value="detachment"
          >
            {{ detachment.toLowerCase() }}
          </option>
          <option
            v-if="detachments.boardingActions.length > 0"
            disabled
            class="toolbar__detachment-separator"
          >
            BOARDING ACTIONS
          </option>
          <option
            v-for="(detachment, index) in detachments.boardingActions"
            :key="'ba-' + index"
            :value="detachment"
          >
            {{ getDetachmentDisplayName(detachment).toLowerCase() }}
          </option>
        </select>
      </template>
    </div>

    <div class="toolbar__group toolbar__group--filter">
      <input
        type="text"
        :value="appStore.codexFilter"
        @input="appStore.codexFilter = $event.target.value"
        placeholder="Filter Datasheets"
        class="toolbar__codex-filter"
      />
    </div>

    <div class="toolbar__group">
      <CodexOptions />
    </div>
  </ToolBar>
</template>

<style scoped lang="scss">
.codex-toolbar {
  .toolbar {
    &__codex-filter {
      width: 7em;
    }

    &__faction-select,
    &__subfaction-select,
    &__detachment-select {
      text-transform: capitalize;
    }

    &__faction-select--2,
    &__detachment-select--2 {
      max-width: calc(50vw - 300px);

      @media (max-width: 1160px) {
        max-width: calc(50vw - 185px);
      }
    }

    &__faction-select--3,
    &__subfaction-select--3,
    &__detachment-select--3 {
      max-width: calc(33vw - 200px);

      @media (max-width: 1160px) {
        max-width: calc(33vw - 125px);
      }
    }

    &__detachment-separator {
      font-size: 0.75em;
      color: #999;
    }

    &__group {
      &--sort {
        display: flex;
        justify-content: flex-end;
        min-width: 250px;
      }

      &--filter {
        @media (max-width: 1160px) {
          display: none;
        }
      }

      &--faction {
        flex-grow: 1;
        justify-content: center;
      }
    }
  }
}
</style>
