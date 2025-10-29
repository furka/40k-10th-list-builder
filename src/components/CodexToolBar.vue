<script setup>
import { computed } from "vue";
import CodexOptions from "./CodexOptions.vue";
import SortArmyButton from "./SortArmyButton.vue";
import ToolBar from "./ToolBar.vue";
import { CONFIGS } from "../data/configs";

const props = defineProps({
  factions: Array,
  currentMFM: Object,
  currentList: Object,
  boardingActions: Object,
  availableSubFactions: Array,
  codexFilter: String,
  currentListSortOrder: String,
  showPointsChanges: Boolean,
  showForgeWorld: Boolean,
  showLegends: Boolean,
  editCollection: Boolean,
  sortOrder: String,
  group: String,
});

const emit = defineEmits([
  'set-sort-order',
  'set-show-points-changes',
  'set-show-forge-world',
  'set-show-legends',
  'set-edit-collection',
  'set-codex-sort-order',
  'set-group',
  'set-faction',
  'set-sub-faction',
  'set-detachment',
  'set-codex-filter',
]);

const factionsFiltered = computed(() => {
  const factions = props.factions
    .map((f) => f.name)
    .filter((factionName) => {
      return !CONFIGS["sub-factions"][factionName];
    });
  factions.sort();
  return factions;
});

const detachments = computed(() => {
  const faction = props.factions.find(
    (f) =>
      f.name?.toUpperCase() === props.currentList.faction?.toUpperCase()
  );

  if (!faction?.detachments) return null;

  const baseFactions = props.currentMFM?.FACTIONS || [];
  const baseFaction = baseFactions.find(
    (f) => f.name === props.currentList.faction
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
    props.boardingActions[props.currentList.faction]?.[
      detachmentName
    ];
  return config?.displayName || detachmentName;
}
</script>

<template>
  <ToolBar class="codex-toolbar">
    <div class="toolbar__group toolbar__group--sort">
      <SortArmyButton
        :sort-order="props.currentListSortOrder"
        @set-sort-order="emit('set-sort-order', $event)"
      />
    </div>

    <div class="toolbar__group toolbar__group--faction">
      <select
        :value="props.currentList.faction"
        @change="emit('set-faction', $event.target.value)"
        class="toolbar__faction-select"
        :class="
          props.availableSubFactions.length > 0
            ? 'toolbar__faction-select--3'
            : 'toolbar__faction-select--2'
        "
      >
        <option v-for="(faction, index) in factionsFiltered" :value="faction">
          {{ faction.toLowerCase() }}
        </option>
      </select>
      <template v-if="props.availableSubFactions.length > 0">
        <span>—</span>
        <select
          :value="props.currentList.subFaction"
          @change="emit('set-sub-faction', $event.target.value === 'null' ? null : $event.target.value)"
          class="toolbar__subfaction-select toolbar__subfaction-select--3"
        >
          <option :value="null">none</option>
          <option
            v-for="(subFaction, index) in props.availableSubFactions"
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
          :value="props.currentList.detachment"
          @change="emit('set-detachment', $event.target.value)"
          class="toolbar__detachment-select"
          :class="
            props.availableSubFactions.length > 0
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
            {{ props.currentList.subFaction }}
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
        :value="props.codexFilter"
        @input="emit('set-codex-filter', $event.target.value)"
        placeholder="Filter Datasheets"
        class="toolbar__codex-filter"
      />
    </div>

    <div class="toolbar__group">
      <CodexOptions
        :show-points-changes="props.showPointsChanges"
        :show-forge-world="props.showForgeWorld"
        :show-legends="props.showLegends"
        :edit-collection="props.editCollection"
        :sort-order="props.sortOrder"
        :group="props.group"
        @set-show-points-changes="emit('set-show-points-changes', $event)"
        @set-show-forge-world="emit('set-show-forge-world', $event)"
        @set-show-legends="emit('set-show-legends', $event)"
        @set-edit-collection="emit('set-edit-collection', $event)"
        @set-sort-order="emit('set-codex-sort-order', $event)"
        @set-group="emit('set-group', $event)"
      />
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
