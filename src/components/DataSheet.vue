<script setup>
import { computed } from "vue";
import { GROUP_NONE, SORT_EXPENSIVE_FIRST } from "../data/constants";
import { sortOptionsPtsDescending } from "../utils/sort-functions";
import { isBattleLine } from "../utils/is-battleline";
import { unitMax } from "../utils/unit-max";
import { getPreviousMFM, getUnitPointsDifference } from "../utils/mfm";

const props = defineProps({
  dataSheet: Object,
  appData: Object,
});

const collection = computed(() => {
  let entry = props.appData.collection.find(
    (u) => u.name === props.dataSheet.name
  );

  if (!entry) {
    entry = {
      name: props.dataSheet.name,
      owned: 999,
    };
    props.appData.collection.push(entry);
  }

  return entry;
});

function onCollectionBlur(collection) {
  collection.owned = Math.min(999, Math.max(0, Number(collection.owned)));
}

const options = computed(() => {
  const currentMFM = props.appData.currentMFM;
  const previousMFM = getPreviousMFM(currentMFM);

  const sizes = [...props.dataSheet.sizes].map((size) => {
    const unit = {
      name: props.dataSheet.name,
      optionName: size.name,
      models: size.models,
      points: size.points,
    };

    const pointsDiff = previousMFM
      ? getUnitPointsDifference(unit, currentMFM, previousMFM)
      : 0;

    return {
      ...size,
      pointsChange:
        pointsDiff !== 0
          ? pointsDiff > 0
            ? `+${pointsDiff}`
            : `${pointsDiff}`
          : null,
    };
  });

  if (props.appData.sortOrder === SORT_EXPENSIVE_FIRST) {
    sizes.sort(sortOptionsPtsDescending);
  }

  return sizes;
});

const count = computed(() => {
  return props.appData.currentList.units.filter(
    (unit) => unit.name === props.dataSheet.name && !unit.bonus
  )?.length;
});

const maxed = computed(() => {
  const max = unitMax(props.dataSheet, props.appData.currentList.detachment);
  return count.value >= max;
});

const max = computed(() => {
  return unitMax(props.dataSheet, props.appData.currentList.detachment);
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
  return props.appData.currentList.units
    .filter((u) => u.name === props.dataSheet.name)
    .reduce((acc, curr) => acc + curr.models, 0);
});

const color = computed(() => {
  let up = false;
  let down = false;

  options.value.forEach((o) => {
    if (!o.pointsChange) {
      return;
    }
    if (o.pointsChange.startsWith("+")) {
      up = true;
    }
    if (o.pointsChange.startsWith("-")) {
      down = true;
    }
  });

  if (up && down) {
    return "rgba(111, 97, 0, 0.85)";
  } else if (up) {
    return "rgba(150, 0, 0, 0.85)";
  } else if (down) {
    return "rgba(0, 145, 77, 0.85)";
  } else {
    return "rgba(0, 0, 0, 0.65)";
  }
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
    props.appData.currentList.units.filter(
      (u) => u.optionName === enhancement.name
    )?.length > 0
  );
}

function upOrDown(change) {
  if (change.startsWith("+")) {
    return "data-sheet__points--up";
  }
  return "data-sheet__points--down";
}

function optionAvailable(option) {
  if (option.bonus) {
    return true;
  }

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
  <div class="data-sheet" v-if="owned && options.length">
    <div
      class="data-sheet__title"
      :class="{ maxed: maxed }"
      :style="appData.showPointsChanges ? `background-color: ${color};` : ''"
    >
      <span class="data-sheet__name">
        <template v-if="count > -1"> {{ count }}/{{ max }}</template>
        {{ props.dataSheet.name }}
        <template v-if="props.appData.group === GROUP_NONE">
          <span
            v-if="
              isBattleLine(
                props.dataSheet,
                props.appData.currentList.detachment
              )
            "
            title="Battleline"
            >[B]</span
          >
          <span v-if="props.dataSheet.character" title="Character">[C]</span>
          <span
            v-if="props.dataSheet.dedicatedTransport"
            title="Dedicated Transport"
            >[T]</span
          >
          <span v-if="props.dataSheet.forgeWorld" title="Forgeworld">[F]</span>
        </template>
        <span v-if="props.dataSheet.epicHero" title="Epic Hero">[E]</span>
        <span v-if="props.dataSheet.legends" title="Legends">[L]</span>
      </span>

      <label
        v-if="!props.dataSheet.enhancements && props.appData.editCollection"
      >
        Models owned:
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
        class="data-sheet__count"
      >
        <template v-if="collection.owned < 999">
          {{ modelsTaken }} / {{ collection.owned }}
        </template>
      </div>
    </div>
    <ul>
      <li
        v-for="(option, index) in options"
        @click="
          optionAvailable(option) ? $emit('add', props.dataSheet, option) : null
        "
        :class="{ maxed: !optionAvailable(option) }"
      >
        <span v-if="option.models">
          {{ option.models }}
          {{ option.models === 1 ? "model" : "models" }}
        </span>
        <span v-if="option.name" class="data-sheet__option-name">
          {{ option.name }}
        </span>
        <span class="data-sheet__option-spacer"></span>
        <span class="data-sheet__points">
          <span
            v-if="option.pointsChange && appData.showPointsChanges"
            :class="upOrDown(option.pointsChange)"
          >
            ({{ option.pointsChange }})
          </span>
          <template v-if="option.bonus">+</template>
          {{ option.points }} pts
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.data-sheet {
  margin-bottom: 1px;
  width: 300px;
  writing-mode: horizontal-tb;

  &__title {
    align-items: center;
    align-items: flex-end;
    background-color: rgba(0, 0, 0, 0.65);
    color: #fff;
    display: flex;
    font-weight: bold;
    justify-content: space-between;
    padding: 2px 4px;
    position: relative;
  }

  &__name {
    line-height: 20px;

    > span {
      cursor: help;
    }
  }

  label {
    align-items: center;
    background-color: #000;
    border-bottom: 2px dashed currentColor;
    bottom: 0;
    display: flex;
    font-size: 12px;
    padding: 4px;
    position: absolute;
    right: 0;
    top: 0;
  }

  &__owned {
    background-color: transparent;
    border: none;
    color: currentcolor;
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: bold;
    padding: 2px;
    text-align: left;
    width: 3em;
  }

  &__count {
    flex-shrink: 0;
  }

  &__option-name {
    text-transform: capitalize;
  }

  &__option-spacer {
    border-bottom: 2px dotted black;
    flex-grow: 1;
    margin: 4px 2px;
  }

  &__points {
    flex-shrink: 0;

    &--up {
      color: rgb(150, 0, 0);
    }
    &--down {
      color: rgb(0, 145, 77);
    }
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
