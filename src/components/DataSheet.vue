<script setup>
import { computed, watch } from "vue";
const props = defineProps({
  dataSheet: Object,
  appData: Object,
});

const collection = computed(() => {
  return props.appData.collection.find((u) => u.name === props.dataSheet.name);
});

function onCollectionBlur(collection) {
  collection.owned = Math.min(999, Math.max(0, Number(collection.owned)));
}

// test

if (!props.dataSheet.enhancements && !collection.value) {
  props.appData.collection.push({
    name: props.dataSheet.name,
    owned: 999,
  });
}

const count = computed(() => {
  return props.appData.units.filter(
    (unit) => unit.name === props.dataSheet.name
  ).length;
});

const maxed = computed(() => {
  const max = props.dataSheet.max || 3;
  return count.value >= max;
});

const owned = computed(() => {
  if (props.dataSheet.enhancements) {
    return true;
  }

  if (props.appData.editCollection) {
    return true;
  }

  return collection.value.owned > 0;
});

const modelsTaken = computed(() => {
  return props.appData.units
    .filter((u) => u.name === props.dataSheet.name)
    .reduce((acc, curr) => acc + curr.models, 0);
});

function enoughInCollection(option) {
  const owned = collection.value.owned;

  if (!option.models) {
    return true;
  }

  return option.models + modelsTaken.value <= owned;
}

function enhancementTaken(enhancement) {
  return (
    props.appData.units.filter((u) => u.optionName === enhancement.name)
      .length > 0
  );
}

function optionAvailable(option) {
  if (maxed.value) {
    return false;
  }

  if (props.dataSheet.enhancements) {
    return !enhancementTaken(option);
  }

  return enoughInCollection(option);
}
</script>

<template>
  <div class="data-sheet" v-if="owned">
    <div class="data-sheet__title" :class="{ maxed: maxed }">
      <span class="data-sheet__name">
        <span v-if="count > 0"> ({{ count }}) </span>
        {{ props.dataSheet.name }}
      </span>

      <label
        v-if="!props.dataSheet.enhancements && props.appData.editCollection"
      >
        Owned:
        <input
          class="data-sheet__owned"
          type="number"
          min="0"
          max="999"
          title="How many of these do you own?"
          v-model="collection.owned"
          @focus="$event.target.select()"
          @blur="onCollectionBlur(collection)"
        />
      </label>

      <div
        v-if="!props.dataSheet.enhancements && !props.appData.editCollection"
      >
        <template v-if="collection.owned < 999">
          {{ modelsTaken }} / {{ collection.owned }}
        </template>
      </div>
    </div>
    <ul>
      <li
        v-for="(option, index) in props.dataSheet.sizes"
        @click="
          optionAvailable(option) ? $emit('add', props.dataSheet, option) : null
        "
        :class="{ maxed: !optionAvailable(option) }"
      >
        <span v-if="option.models">
          {{ option.models }}
          {{ option.models === 1 ? "model" : "models" }}
        </span>
        <span v-if="option.name">
          {{ option.name }}
        </span>
        <span class="data-sheet__option-spacer"></span>
        <span>{{ option.points }} pts</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.data-sheet {
  margin-bottom: 1px;
  width: 250px;
  writing-mode: horizontal-tb;

  &__title {
    background-color: rgba(0, 0, 0, 0.65);
    color: #fff;
    display: flex;
    font-weight: bold;
    justify-content: space-between;
    overflow: hidden;
    padding: 4px;
    text-overflow: ellipsis;
    white-space: nowrap;
    align-items: center;
  }

  &__name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    line-height: 20px;
  }

  label {
    display: flex;
    align-items: center;
    border-bottom: 2px dashed currentColor;
    font-size: 12px;
  }

  &__owned {
    width: 3em;
    text-align: left;
    border: none;
    padding: 2px;
    background-color: transparent;
    color: currentcolor;
    font-family: var(--font-family);
    font-weight: bold;
    font-size: 12px;
  }

  &__option-spacer {
    border-bottom: 2px dotted black;
    flex-grow: 1;
    margin: 4px 2px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    border-radius: 3px;
    border: 2px solid transparent;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 2px;

    &:hover {
      border-color: black;
    }
  }

  .maxed {
    cursor: not-allowed;
    opacity: 0.25;

    li {
      cursor: not-allowed;

      &:hover {
        border-color: transparent;
      }
    }
  }
}
</style>
