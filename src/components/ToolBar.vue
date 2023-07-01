<script setup>
import { computed } from "vue";
import PrintableArmyList from "./PrintableArmyList.vue";
const props = defineProps({
  appData: Object,
});

const points = computed(() => {
  return props.appData.units.reduce((acc, curr) => acc + curr.points, 0);
});

const factions = computed(() => {
  return props.appData.compendium.map((faction) => faction.name);
});

const detachments = computed(() => {
  return props.appData.compendium
    .find((faction) => faction.name === props.appData.faction)
    .detachments?.map((detachment) => detachment.name);
});
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__points toolbar__group">
      <PrintableArmyList :app-data="props.appData" />
      <label>
        <span :class="{ over: points > props.appData.maxPoints }">
          {{ points }}
        </span>
        /
        <input
          type="number"
          min="500"
          step="500"
          v-model.number="props.appData.maxPoints"
          class="toolbar__points-input"
        />
      </label>
    </div>

    <div class="toolbar__group">
      <label>
        <select v-model="props.appData.faction">
          <option v-for="(faction, index) in factions">
            {{ faction }}
          </option>
        </select>
        —
        <select v-model="props.appData.detachment">
          <option v-for="(faction, index) in detachments">
            {{ faction }}
          </option>
        </select>
      </label>
    </div>

    <div class="toolbar_faction toolbar__group">
      <label>
        <input type="checkbox" v-model="props.appData.editCollection" />
        Edit Collection
      </label>
    </div>

    <div class="toolbar__group">
      <label>
        <input
          type="text"
          v-model="props.appData.codexFilter"
          placeholder="Filter Codex"
          class="toolbar__codex-filter"
        />
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  --font-size: 28px;
  background-color: #333;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  input,
  select {
    background-color: transparent;
    border-bottom: 2px dashed white;
    border-left: none;
    border-right: none;
    border-top: none;
    color: currentcolor;
    font-family: var(--font-family);
    font-size: var(--font-size);

    option {
      color: initial;
    }

    &::placeholder {
      color: #aaa;
    }
  }

  &__group {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    font-size: var(--font-size);
    justify-content: flex-end;
    margin-inline: 8px;
  }

  &__points {
    display: flex;
    justify-content: space-between;

    label {
      margin-inline-start: 32px;
    }

    .over {
      color: #ff0000;
    }
  }

  &__codex-filter {
    width: 5em;
  }

  &__points-input {
    width: 3em;
  }

  input[type="checkbox"] {
    width: 1em;
    height: 1em;
  }

  label {
    align-items: center;
    display: flex;
    flex-direction: row;
    cursor: pointer;
  }
}
</style>
