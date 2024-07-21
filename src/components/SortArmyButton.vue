<script setup>
import {
  SORT_ALPHABETICAL,
  SORT_CHEAPEST_FIRST,
  SORT_EXPENSIVE_FIRST,
} from "../data/constants";
import DropDown from "./DropDown.vue";
import SortIcon from "../assets/descending-icon.svg";
import {
  sortDataSheetAlphabetical,
  sortListPoints,
} from "../utils/sort-functions";

const props = defineProps({
  appData: Object,
});

function sortAlphabetical() {
  props.appData.currentList.units.sort(sortDataSheetAlphabetical);
}

function sortPointsAsc() {
  props.appData.currentList.units.sort(sortListPoints).reverse();
}

function sortPointsDesc() {
  props.appData.currentList.units.sort(sortListPoints);
}
</script>

<template>
  <DropDown class="sort-army">
    <template v-slot:button>
      <SortIcon class="dropdown__icon" />
      <span>Sort</span>
    </template>
    <template v-slot:content>
      <form method="dialog">
        <h1>Sort Army List</h1>
        <button @click="sortAlphabetical">{{ SORT_ALPHABETICAL }}</button>
        <button @click="sortPointsAsc">{{ SORT_CHEAPEST_FIRST }}</button>
        <button @click="sortPointsDesc">{{ SORT_EXPENSIVE_FIRST }}</button>
      </form>
    </template>
  </DropDown>
</template>

<style scoped lang="scss">
.sort-army {
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
  }
}
</style>
