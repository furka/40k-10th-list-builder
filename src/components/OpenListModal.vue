<script setup>
import { ref, computed } from "vue";
import OpenIcon from "../assets/computer-folder-open-icon.svg";
import DeleteIcon from "../assets/recycle-bin-line-icon.svg";
import ModalWithButton from "./ModalWithButton.vue";

const props = defineProps({
  appData: Object,
});

function points(units) {
  return units.reduce((acc, curr) => acc + curr.points, 0);
}

function selectList(list) {
  const i = props.appData.lists.indexOf(list);
  props.appData.lists.splice(i, 1);
  props.appData.lists.unshift(props.appData.currentList);
  props.appData.currentList = list;
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
        <li v-for="(list, index) in props.appData.lists">
          <form method="dialog">
            <button @click="selectList(list)" class="open-modal__button">
              <template v-if="list.name">
                <b>{{ list.name }}</b> —
              </template>
              {{ list.faction }} — {{ list.detachment }} —
              {{ points(list.units) }} pts
            </button>
          </form>
          <button
            class="open-modal__delete"
            @click="deleteList(list)"
            title="DELETE LIST?"
          >
            <DeleteIcon />
          </button>
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
  }

  li + li {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  &__delete {
    margin-inline-start: 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 3px;
    border-radius: 6px;

    &:hover {
      background-color: #f00;
    }

    svg {
      height: 24px;
      width: 24px;
    }
  }

  &__button {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-family);
    font-size: 16px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
