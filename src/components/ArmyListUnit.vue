<script setup>
import { computed } from "vue";
import RiskIcon from "../assets/risk-icon.svg";
import { unitMax } from "../utils/unit-max";

const props = defineProps({
  appData: Object,
  unit: Object,
  scale: Number,
});

const height = computed(() => {
  return `${Math.floor(props.unit.points * props.scale)}px`;
});

const name = computed(() => {
  let name = "";

  if (props.unit.bonus) {
    name += "+ ";
  }

  if (props.unit.models) {
    name += `(${props.unit.models}) `;
  }

  if (props.unit.name === "Enhancements") {
    name += `[Enh] ${props.unit.optionName}`;
  } else if (props.unit.optionName) {
    name += `${props.unit.name} — ${props.unit.optionName}`;
  } else {
    name += props.unit.name;
  }

  return name;
});

const inValid = computed(() => {
  if (props.unit.error) {
    return "Invalid Unit";
  }

  const count = props.appData.currentList.units.filter(
    (u) => u.name === props.unit.name
  ).length;
  if (count > unitMax(props.unit, props.appData.currentList.detachment)) {
    return `Only ${unitMax(
      props.unit,
      props.appData.currentList.detachment
    )} of this unit allowed`;
  }

  if (props.unit.name === "Enhancements") {
    const availableEnhancements = props.appData.compendium
      ?.find((u) => u.name === "Enhancements")
      ?.sizes.filter(
        (s) =>
          s.detachment?.toUpperCase() ===
          props.appData.currentList.detachment?.toUpperCase()
      )
      .map((e) => e.name);

    if (!availableEnhancements.includes(props.unit.optionName)) {
      return "Enhancement not available in this detachment";
    }
  }

  return false;
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
    <span class="army-list-unit__points"> {{ props.unit.points }} pts </span>
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
