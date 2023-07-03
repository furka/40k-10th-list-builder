<script setup>
import { computed } from "vue";

const props = defineProps({
  appData: Object,
});

const PADSIZE = 10;

const points = computed(() => {
  return props.appData.currentList.units.reduce(
    (acc, curr) => acc + curr.points,
    0
  );
});

const maxUnitNameLength = computed(() => {
  const length = props.appData.currentList.units.reduce(
    (acc, curr) => Math.max(acc, formatUnit(curr).length),
    0
  );
  return length + PADSIZE + 3;
});

function formatUnit(unit) {
  let name = unit.name;
  if (unit.optionName) {
    name += ` — ${unit.optionName}`;
  }

  if (unit.models) {
    name += ` (${unit.models})`;
  }

  return name;
}

function unitLine(unit) {
  return (
    formatUnit(unit).padEnd(
      maxUnitNameLength.value - String(unit.points).length,
      "."
    ) + `${unit.points} pts`
  );
}
</script>

<template>
  <article class="army-list">
    <h1 v-if="props.appData.currentList.name">
      {{ props.appData.currentList.name }}
    </h1>
    <h2>
      <span class="army-list__name">
        {{ props.appData.currentList.faction }} —
        {{ props.appData.currentList.detachment }}
      </span>
      — {{ points }} pts
    </h2>

    <ul>
      <li v-for="(unit, index) in props.appData.currentList.units">
        {{ unitLine(unit) }}
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
.army-list {
  &__name {
    text-transform: capitalize;
  }

  ul {
    list-style: none;
    padding: 0;
  }
}
</style>
