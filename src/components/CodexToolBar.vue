<script setup>
import { computed } from "vue";
import CodexOptions from "./CodexOptions.vue";
import SortArmyButton from "./SortArmyButton.vue";
import ToolBar from "./ToolBar.vue";
import { CONFIGS } from "../data/configs";

const props = defineProps({
  appData: Object,
});

const factions = computed(() => {
  const factions = props.appData.factions
    .map((f) => f.name)
    .filter((factionName) => {
      return !CONFIGS["sub-factions"][factionName];
    });
  factions.sort();
  return factions;
});

const detachments = computed(() => {
  const faction = props.appData.factions.find(
    (f) =>
      f.name?.toUpperCase() === props.appData.currentList.faction?.toUpperCase()
  );

  if (!faction?.detachments) return null;

  const baseFactions = props.appData.currentMFM?.FACTIONS || [];
  const baseFaction = baseFactions.find(
    (f) => f.name === props.appData.currentList.faction
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
  const config =
    props.appData.boardingActions[props.appData.currentList.faction]?.[
      detachmentName
    ];
  return config?.displayName || detachmentName;
}
</script>

<template>
  <ToolBar class="codex-toolbar">
    <div class="toolbar__group toolbar__group--sort">
      <SortArmyButton :app-data="props.appData" />
    </div>

    <div class="toolbar__group toolbar__group--faction">
      <select
        v-model="props.appData.currentList.faction"
        class="toolbar__faction-select"
        :class="
          props.appData.availableSubFactions.length > 0
            ? 'toolbar__faction-select--3'
            : 'toolbar__faction-select--2'
        "
      >
        <option v-for="(faction, index) in factions" :value="faction">
          {{ faction.toLowerCase() }}
        </option>
      </select>
      <template v-if="props.appData.availableSubFactions.length > 0">
        <span>—</span>
        <select
          v-model="props.appData.currentList.subFaction"
          class="toolbar__subfaction-select toolbar__subfaction-select--3"
        >
          <option :value="null">none</option>
          <option
            v-for="(subFaction, index) in props.appData.availableSubFactions"
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
          v-model="props.appData.currentList.detachment"
          class="toolbar__detachment-select"
          :class="
            props.appData.availableSubFactions.length > 0
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
            {{ props.appData.currentList.subFaction }}
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
        v-model="props.appData.codexFilter"
        placeholder="Filter Datasheets"
        class="toolbar__codex-filter"
      />
    </div>

    <div class="toolbar__group">
      <CodexOptions :app-data="props.appData" />
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
