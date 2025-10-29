<script setup>
import { computed } from "vue";
import RiskIcon from "../assets/risk-icon.svg";
import { nameEquals } from "../utils/name-match";
import { useArmyListStore } from "../stores/armyList";
import { useMfmStore } from "../stores/mfm";

const armyListStore = useArmyListStore();
const mfmStore = useMfmStore();

const props = defineProps({
  unit: Object,
  scale: Number,
});

const unitPoints = computed(() => {
  const points = mfmStore.getPoints(props.unit, armyListStore.currentMFM);
  return points > 0 ? points : 0;
});

const height = computed(() => {
  return `${Math.floor(unitPoints.value * props.scale)}px`;
});

const name = computed(() => {
  let name = "";

  if (props.unit.bonus) {
    name += "+ ";
  }

  if (props.unit.models) {
    name += `(${props.unit.models}) `;
  }

  if (nameEquals(props.unit.name, "Enhancements")) {
    name += `[Enh] ${props.unit.optionName}`;
  } else if (props.unit.optionName) {
    name += `${props.unit.name} — ${props.unit.optionName}`;
  } else {
    name += props.unit.name;
  }

  return name;
});

const inValid = computed(() => {
  return armyListStore.getUnitValidationError(props.unit);
});
</script>

<template>
  <div
    class="army-list-unit"
    :data-id="props.unit.id"
    :title="name"
    :class="{ error: inValid }"
  >
    <span class="army-list-unit__warning" :title="inValid" v-if="inValid">
      <RiskIcon class="army-list-unit__warning-icon" />
    </span>
    <span class="army-list-unit__name">
      {{ name }}
    </span>
    <span class="army-list-unit__points" v-if="unitPoints > 0">
      {{ unitPoints }} pts
    </span>
  </div>
</template>

<style scoped lang="scss">
.army-list-unit {
  align-items: center;
  background-color: rgb(0 89 46);
  border: 1px solid black;
  box-sizing: border-box;
  cursor: move;
  display: flex;
  flex-basis: v-bind("height");
  justify-content: space-between;
  position: relative;
  z-index: 1;

  &.error {
    background-color: rgb(89, 0, 0);
  }

  &:hover {
    z-index: 2;
  }

  &__name {
    color: #fff;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: bold;
    overflow: hidden;
    padding: 0 4px;

    &:hover {
      background-color: inherit;
      overflow: initial;
    }
  }

  &__points {
    color: #fff;
    font-family: sans-serif;
    font-size: 12px;
    font-weight: bold;
    padding: 0 4px;
    text-align: center;
    white-space: nowrap;
  }

  &__warning {
    cursor: help;
    padding: 4px;
    position: absolute;

    &-icon {
      height: 24px;
      width: 24px;
    }
  }

  &__warning + &__name {
    margin-inline-start: 32px;
  }
}
.sortable-ghost {
  opacity: 0;
}
</style>
