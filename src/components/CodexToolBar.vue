<script setup>
import { computed } from "vue";
import CodexOptions from "./CodexOptions.vue";
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
  return props.appData.factions
    .find((f) => f.name === props.appData.currentList.faction)
    ?.detachments?.map((d) => d.name);
});
</script>

<template>
  <ToolBar class="codex-toolbar">
    <div class="toolbar__group toolbar__group--faction">
      <select
        v-model="props.appData.currentList.faction"
        class="toolbar__faction-select"
      >
        <option v-for="(faction, index) in factions" :value="faction">
          {{ faction.toLowerCase() }}
        </option>
      </select>
      <template v-if="detachments?.length > 0">
        <span>—</span>
        <select
          v-model="props.appData.currentList.detachment"
          class="toolbar__detachment-select"
        >
          <option v-for="(faction, index) in detachments" :value="faction">
            {{ faction.toLowerCase() }}
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
    }

    &__group {
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
