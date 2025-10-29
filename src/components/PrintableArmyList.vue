<script setup>
import { computed } from "vue";
import { useArmyListStore } from "../stores/armyList";
import { useMfmStore } from "../stores/mfm";
import { BOARDING_ACTIONS } from "../data/configs";

const armyListStore = useArmyListStore();
const mfmStore = useMfmStore();

const detachmentDisplayName = computed(() => {
  const detachment = armyListStore.detachment;
  if (!detachment) return "";
  const config = BOARDING_ACTIONS[armyListStore.faction]?.[detachment];
  return config?.displayName || detachment;
});

const PADSIZE = 10;

function getUnitPoints(unit) {
  const unitPoints = mfmStore.getPoints(unit, armyListStore.currentMFM);
  return unitPoints > 0 ? unitPoints : 0;
}

const validUnits = computed(() => {
  return armyListStore.units.filter(
    (unit) => getUnitPoints(unit) > 0
  );
});

const points = computed(() => {
  return validUnits.value.reduce((acc, curr) => acc + getUnitPoints(curr), 0);
});

const maxUnitNameLength = computed(() => {
  const length = validUnits.value.reduce(
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
  const unitPoints = getUnitPoints(unit);
  return (
    formatUnit(unit).padEnd(
      maxUnitNameLength.value - String(unitPoints).length,
      "."
    ) + `${unitPoints} pts`
  );
}
</script>

<template>
  <article class="army-list">
    <h1 v-if="armyListStore.name">
      {{ armyListStore.name }}
    </h1>
    <h2>
      <span class="army-list__name">
        {{ armyListStore.faction }} —
        {{ detachmentDisplayName }}
      </span>
      — {{ points }} pts
    </h2>

    <ul>
      <li v-for="(unit, index) in validUnits">
        {{ unitLine(unit) }}
      </li>
    </ul>
  </article>
</template>

<style scoped lang="scss">
.army-list {
  h1 {
    word-break: break-word;
  }

  &__name {
    text-transform: capitalize;
  }

  ul {
    list-style: none;
    padding: 0;
  }
}
</style>
