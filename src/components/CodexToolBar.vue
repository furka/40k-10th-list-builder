<script setup>
import { computed } from "vue";
import CodexOptions from "./CodexOptions.vue";
import SortArmyButton from "./SortArmyButton.vue";
import ToolBar from "./ToolBar.vue";

const props = defineProps({
  appData: Object,
});

const factions = computed(() => {
  const factions = props.appData.factions.map((f) => f.name);
  factions.sort();
  return factions;
});

const detachments = computed(() => {
  const faction = props.appData.factions.find(
    (f) =>
      f.name?.toUpperCase() === props.appData.currentList.faction?.toUpperCase()
  );

  if (!faction?.detachments) return null;

  const standardDetachments = faction.detachments
    .filter((d) => !d.boardingActions)
    .map((d) => d.name);

  const boardingActionsDetachments = faction.detachments
    .filter((d) => d.boardingActions)
    .map((d) => d.name);

  return {
    standard: standardDetachments,
    boardingActions: boardingActionsDetachments,
  };
});

function getDetachmentDisplayName(detachmentName) {
  const config = props.appData.boardingActions[props.appData.currentList.faction]?.[detachmentName];
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
      >
        <option v-for="(faction, index) in factions" :value="faction">
          {{ faction.toLowerCase() }}
        </option>
      </select>
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
        >
          <option
            v-for="(detachment, index) in detachments.standard"
            :key="'standard-' + index"
            :value="detachment"
          >
            {{ detachment.toLowerCase() }}
          </option>
          <option
            v-if="detachments.boardingActions.length > 0"
            disabled
            class="ba-separator"
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
    &__detachment-select {
      max-width: calc(50vw - 300px);
      text-transform: capitalize;

      @media (max-width: 1160px) {
        max-width: calc(50vw - 185px);
      }

      .ba-separator {
        font-size: 0.75em;
        color: #999;
      }
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
