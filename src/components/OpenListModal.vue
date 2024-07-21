<script setup>
import { MFM_VERSION } from "../utils/data-reader";
import OpenIcon from "../assets/computer-folder-open-icon.svg";
import DeleteIcon from "../assets/recycle-bin-line-icon.svg";
import CopyIcon from "../assets/text-documents-line-icon.svg";
import RiskIcon from "../assets/risk-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";
import { computed } from "vue";

const props = defineProps({
  appData: Object,
});

function points(units) {
  return units.reduce((acc, curr) => acc + curr.points, 0);
}

const lists = computed(() => {
  return [props.appData.currentList, ...props.appData.lists];
});

async function selectList(list) {
  if (list === props.appData.currentList) {
    return;
  }

  const detachment = list.detachment;
  const i = props.appData.lists.indexOf(list);
  props.appData.lists.splice(i, 1);
  props.appData.lists.unshift(props.appData.currentList);
  props.appData.currentList = list;

  // not sure, why but changing the list of options and default value of the
  // dropdown at the same time causes the wrong value to be selected
  await new Promise((r) => requestAnimationFrame(r));
  props.appData.currentList.detachment = detachment;
}

function copyList(list) {
  let i;
  if (list === props.appData.currentList) {
    i = 0;
  } else {
    i = props.appData.lists.indexOf(list);
  }
  const clone = JSON.parse(JSON.stringify(list));
  props.appData.lists.splice(i, 0, clone);
}

function deleteList(list) {
  const i = props.appData.lists.indexOf(list);
  props.appData.lists.splice(i, 1);
}
</script>

<template>
  <ModalWithButton class="open-modal">
    <template v-slot:button>
      <OpenIcon class="modal-button__icon" /> <span> Saved Lists </span>
    </template>
    <template v-slot:content>
      <h2>Saved lists</h2>
      <ul>
        <li v-for="(list, index) in lists">
          <form method="dialog">
            <button @click="selectList(list)" class="open-modal__button">
              <template v-if="list.name">
                <b>{{ list.name }}</b> —
              </template>
              {{ list.faction }} —
              <template v-if="list.detachment">
                {{ list.detachment }} —
              </template>
              {{ points(list.units) }} pts
              <b v-if="index === 0"> (current)</b>
            </button>
          </form>
          <span>
            <span
              v-if="list.mfm_version !== MFM_VERSION"
              title="List created using old point values"
              class="open-modal__warning"
            >
              <RiskIcon />
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

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
