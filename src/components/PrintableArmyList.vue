<script setup>
import { ref, computed } from "vue";
import DocumentIcon from "../assets/text-document-line-icon.svg";
import CloseIcon from "../assets/close-line-icon.svg";

const props = defineProps({
  appData: Object,
});

const PADSIZE = 10;

const dialog = ref(null);

function openDialog() {
  dialog.value.showModal();
}

const points = computed(() => {
  return props.appData.units.reduce((acc, curr) => acc + curr.points, 0);
});

const maxUnitNameLength = computed(() => {
  const length = props.appData.units.reduce(
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
  <button class="print-button" @click="openDialog">
    <DocumentIcon class="print-button__icon" /> <span> List </span>
  </button>

  <dialog ref="dialog" class="print-modal">
    <div class="print-modal__content">
      <h2>
        <span class="name">
          {{ props.appData.faction }} — {{ props.appData.detachment }}
        </span>
        — {{ points }} pts
      </h2>

      <ul>
        <li v-for="(unit, index) in props.appData.units">
          {{ unitLine(unit) }}
        </li>
      </ul>
    </div>

    <form method="dialog">
      <button class="print-modal__close" autofocus>
        <CloseIcon class="print-modal__close-icon" />
      </button>
    </form>
  </dialog>
</template>

<style scoped lang="scss">
.print-button {
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;

  &__icon {
    fill: currentColor;
    height: 23px;
    width: 23px;
  }
}
.print-modal {
  border-radius: 32px;
  border: none;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 16px;
  max-height: 95svh;
  max-width: 80vw;
  overflow: hidden;
  padding: 32px;
  position: relative;

  &[open] {
    display: flex;
  }

  &__content {
    overflow-y: auto;
  }

  .name {
    text-transform: capitalize;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  &__close {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    height: 32px;
    padding: 0;
    position: absolute;
    right: 16px;
    top: 16px;
    width: 32px;

    svg {
      height: 100%;
      width: 100%;
    }
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(4px);
  }
}
</style>
