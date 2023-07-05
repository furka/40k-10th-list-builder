<script setup>
import { ref, computed } from "vue";
import RiskIcon from "../assets/risk-icon.svg";

const props = defineProps({
  unit: Object,
  scale: Number,
  index: Number,
});

const height = computed(() => {
  return `${Math.floor(props.unit.points * props.scale)}px`;
});
const name = computed(() => {
  let name = "";

  if (props.unit.models) {
    name += `(${props.unit.models}) `;
  }
  name += props.unit.name;
  if (props.unit.optionName) {
    name += ` — ${props.unit.optionName}`;
  }
  return name;
});
</script>

<template>
  <div
    class="army-list-unit"
    :data-id="props.unit.id"
    :title="name"
    :class="{ error: props.unit.error }"
  >
    <span
      class="army-list-unit__warning"
      title="This option is no longer valid"
      v-if="unit.error"
    >
      <RiskIcon class="army-list-unit__warning-icon" />
    </span>
    <span class="army-list-unit__name">
      {{ name }}
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
  justify-content: flex-start;
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
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      background-color: inherit;
      overflow: initial;
    }
  }

  &__warning {
    cursor: help;
    padding: 4px;

    &-icon {
      height: 24px;
      width: 24px;
    }
  }
}
.sortable-ghost {
  opacity: 0;
}
</style>
