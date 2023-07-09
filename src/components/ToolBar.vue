<script setup>
import { computed } from "vue";
import { MFM_VERSION } from "../utils/data-reader";
import ViewListModal from "./ViewListModal.vue";
import OpenListModal from "./OpenListModal.vue";
import NewIcon from "../assets/file-line-icon.svg";
import UpdateMFMPointsModal from "./UpdateMFMPointsModal.vue";

const props = defineProps({
  appData: Object,
});

const points = computed(() => {
  return props.appData.currentList.units.reduce(
    (acc, curr) => acc + curr.points,
    0
  );
});

const factions = computed(() => {
  return props.appData.factions.map((f) => f.name);
});

const detachments = computed(() => {
  return props.appData.factions
    .find((f) => f.name === props.appData.currentList.faction)
    ?.detachments?.map((d) => d.name);
});

const outOfDate = computed(() => {
  return props.appData.currentList.mfm_version !== MFM_VERSION;
});
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__row">
      <div class="toolbar__group">
        <button class="toolbar__button" @click="$emit('newList')">
          <NewIcon class="toolbar__icon" />
          <span> New List</span>
        </button>
        <OpenListModal :app-data="props.appData" />
        <ViewListModal :app-data="props.appData" />
      </div>

      <div class="toolbar__group toolbar__group--list-name">
        <input
          type="text"
          v-model="props.appData.currentList.name"
          placeholder="Name your list"
          class="toolbar__list-name"
        />
      </div>

      <div class="toolbar__group">
        <label>
          <input type="checkbox" v-model="props.appData.editCollection" />
          Edit Collection
        </label>
      </div>

      <div class="toolbar__group">
        <input
          type="text"
          v-model="props.appData.codexFilter"
          placeholder="Filter Datasheets"
          class="toolbar__codex-filter"
        />
      </div>
    </div>

    <div class="toolbar__row">
      <div class="toolbar__group toolbar__group--points">
        <UpdateMFMPointsModal
          class="toolbar__warning"
          v-if="outOfDate"
          :app-data="props.appData"
        />
        <label>
          <span :class="{ over: points > props.appData.currentList.maxPoints }">
            {{ points }}
          </span>
          /
          <input
            type="number"
            min="500"
            step="500"
            v-model.number="props.appData.currentList.maxPoints"
            class="toolbar__points-input"
          />
        </label>
      </div>
      <div class="toolbar__group toolbar__group--faction">
        <select
          v-model="props.appData.currentList.faction"
          class="toolbar__faction-select"
        >
          <option v-for="(faction, index) in factions">
            {{ faction }}
          </option>
        </select>
        <template v-if="detachments?.length > 0">
          <span>—</span>
          <select
            v-model="props.appData.currentList.detachment"
            class="toolbar__detachment-select"
          >
            <option v-for="(faction, index) in detachments">
              {{ faction }}
            </option>
          </select>
        </template>
      </div>
      <div class="toolbar__group">
        <label title="Show Forge World units">
          <input type="checkbox" v-model="props.appData.showForgeWorld" />
          Forge World
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  --font-size: 28px;
  background-color: #333;
  color: white;
  display: flex;
  flex-direction: column;

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

  select {
    max-width: calc(50vw - 240px);
  }

  &__button {
    align-items: center;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__icon {
    fill: currentColor;
    height: 23px;
    width: 23px;
  }

  &__warning {
    margin-inline-end: 24px;
  }

  &__row {
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 2px;
  }

  &__row + &__row {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &__group {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    font-size: var(--font-size);
    justify-content: flex-end;
    margin-inline: 8px;

    &--list-name {
      flex-grow: 1;
    }

    &--points {
      display: flex;
      justify-content: center;
      min-width: 230px;

      .over {
        color: #ff0000;
      }
    }

    &--faction {
      flex-grow: 1;
      justify-content: center;
    }
  }

  &__list-name {
    width: 100%;
  }

  &__faction-select,
  &__detachment-select {
    max-width: calc(50vw - 50px);
  }

  &__codex-filter {
    width: 7em;
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
    cursor: pointer;
    display: flex;
    flex-direction: row;
  }
}
</style>
