<script setup>
import {
  SORT_MANUAL,
  SORT_ALPHABETICAL,
  SORT_CHEAPEST_FIRST,
  SORT_EXPENSIVE_FIRST,
  SORT_ROLE,
} from "../data/constants";
import DropDown from "./DropDown.vue";
import SortIcon from "../assets/descending-icon.svg";

const props = defineProps({
  appData: Object,
});

function setSortMode(mode) {
  props.appData.sortOrder = mode;
}
</script>

<template>
  <DropDown class="sort-army" title="Change army list sort order">
    <template v-slot:button>
      <span>Sort: {{ appData.sortOrder }}</span>
      <SortIcon class="dropdown__icon" />
    </template>
    <template v-slot:content>
      <form method="dialog">
        <h1>Sort Army List</h1>
        <button
          @click="setSortMode(SORT_MANUAL)"
          :class="{ active: appData.sortOrder === SORT_MANUAL }"
        >
          {{ SORT_MANUAL }}
        </button>
        <button
          @click="setSortMode(SORT_ALPHABETICAL)"
          :class="{ active: appData.sortOrder === SORT_ALPHABETICAL }"
        >
          {{ SORT_ALPHABETICAL }}
        </button>
        <button
          @click="setSortMode(SORT_CHEAPEST_FIRST)"
          :class="{ active: appData.sortOrder === SORT_CHEAPEST_FIRST }"
        >
          {{ SORT_CHEAPEST_FIRST }}
        </button>
        <button
          @click="setSortMode(SORT_EXPENSIVE_FIRST)"
          :class="{ active: appData.sortOrder === SORT_EXPENSIVE_FIRST }"
        >
          {{ SORT_EXPENSIVE_FIRST }}
        </button>
        <button
          @click="setSortMode(SORT_ROLE)"
          :class="{ active: appData.sortOrder === SORT_ROLE }"
        >
          {{ SORT_ROLE }}
        </button>
      </form>
    </template>
  </DropDown>
</template>

<style scoped lang="scss">
.sort-army {
  :deep(.dropdown__button) {
    flex-direction: row;
    gap: 8px;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  h1 {
    padding: 8px 16px;
    font-family: var(--font-family);
    font-size: 16px;
    font-weight: normal;
    color: #888;
    margin: 0;
    border-bottom: 1px solid #888;
    text-align: center;
  }

  button {
    background: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    border: none;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: var(--font-size);
    padding: 8px 16px;
    text-align: left;

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    &.active {
      background: rgba(0, 0, 0, 0.2);
      font-weight: bold;
    }
  }
}
</style>
