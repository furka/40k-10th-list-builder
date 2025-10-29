<script setup>
import OpenIcon from "../assets/computer-folder-open-icon.svg";
import DeleteIcon from "../assets/recycle-bin-line-icon.svg";
import CopyIcon from "../assets/text-documents-line-icon.svg";
import RiskIcon from "../assets/risk-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import { computed } from "vue";
import { useArmyListStore } from "../stores/armyList";
import { useMfmStore } from "../stores/mfm";
import { useAppStore } from "../stores/app";

const armyListStore = useArmyListStore();
const mfmStore = useMfmStore();
const appStore = useAppStore();

function points(units, list) {
  const mfm = mfmStore.getVersion(list.mfm_version) || mfmStore.MFM.CURRENT;
  return units.reduce((acc, curr) => {
    const unitPoints = mfmStore.getPoints(curr, mfm);
    return acc + (unitPoints > 0 ? unitPoints : 0);
  }, 0);
}

function mfmVersion(list) {
  return list.mfm_version?.replace("VERSION ", "") ?? "???";
}

const lists = computed(() => {
  return [armyListStore.toObject(), ...appStore.lists];
});

function selectList(list) {
  const currentList = armyListStore.toObject();
  if (list === currentList || JSON.stringify(list) === JSON.stringify(currentList)) {
    return;
  }
  appStore.selectList(list);
}

function copyList(list) {
  appStore.copyList(list);
}

function deleteList(list) {
  appStore.deleteList(list);
}
</script>

<template>
  <ModalWithButton class="open-modal" title="Open saved army lists">
    <template v-slot:button>
      <OpenIcon class="modal-button__icon" />
      <span>Saved</span>
    </template>
    <template v-slot:content>
      <h2>Saved lists</h2>
      <ul>
        <li v-for="(list, index) in lists">
          <form method="dialog">
            <button @click="selectList(list)" class="open-modal__button">
              <span v-if="list.name" class="open-modal__list-name">
                <b>{{ list.name }}</b>
              </span>
              <span class="open-modal__list-details">
                <template v-if="list.name">—</template>
                {{ list.faction }} —
                <template v-if="list.subFaction">
                  {{ list.subFaction }} —
                </template>
                <template v-if="list.detachment">
                  {{ list.detachment }} —
                </template>
                {{ points(list.units, list) }} pts
                <b v-if="index === 0"> (current)</b>
              </span>
            </button>
          </form>
          <span class="open-modal__actions">
            <span
              class="open-modal__mfm-version"
              :class="
                mfmStore.isListOutdated(list) ? 'open-modal__mfm-version--outdated' : ''
              "
              :title="
                mfmStore.isListOutdated(list) ? `List has outdated MFM version` : ''
              "
            >
              <span class="open-modal__mfm-label">MFM</span>
              {{ mfmVersion(list) }}
            </span>

            <button
              class="open-modal__copy"
              @click="copyList(list)"
              title="Duplicate list"
            >
              <CopyIcon />
            </button>
            <button
              class="open-modal__delete"
              @click="deleteList(list)"
              title="DELETE LIST?"
              :disabled="index === 0"
            >
              <DeleteIcon />
            </button>
          </span>
        </li>
      </ul>
    </template>
  </ModalWithButton>
</template>

<style scoped lang="scss">
.open-modal {
  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
  }

  li + li {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  &__actions {
    display: flex;
    align-items: center;
    margin-left: 24px;
    flex-shrink: 0;
  }

  &__mfm-version {
    color: #666;
    font-size: 18px;
    margin-right: 8px;
    word-spacing: -8px;
    white-space: nowrap;

    &--outdated {
      cursor: help;
      font-weight: bold;
      color: #c66;
    }
  }

  &__mfm-label {
    font-size: 12px;
    font-weight: bold;
  }

  &__delete,
  &__copy {
    background: transparent;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    margin-inline-start: 16px;
    padding: 3px;

    svg {
      height: 24px;
      width: 24px;
    }

    &[disabled] {
      opacity: 0.5;
    }
  }

  &__delete:not([disabled]):hover {
    background-color: #f00;
  }

  &__warning {
    margin-inline: 8px;
    cursor: help;
    svg {
      height: 24px;
      width: 24px;
    }
  }

  form {
    flex-grow: 1;
    display: flex;
    min-width: 0;
  }

  &__button {
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: 16px;
    padding: 0;
    height: 32px;
    flex-grow: 1;
    text-align: start;
    display: flex;
    min-width: 0;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  &__list-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
    min-width: 0;
  }

  &__list-details {
    flex-shrink: 0;
    white-space: nowrap;
  }
}
</style>
