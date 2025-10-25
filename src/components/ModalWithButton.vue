<script setup>
import { ref } from "vue";
import CloseIcon from "../assets/close-line-icon.svg";

const props = defineProps({
  title: String,
});

const dialog = ref(null);

function openDialog() {
  dialog.value.showModal();
}

function onClick(event) {
  if (event.target === dialog.value) {
    dialog.value.close();
  }
}
</script>

<template>
  <div>
    <button class="modal-button" @click="openDialog" :title="props.title">
      <slot name="button"></slot>
    </button>

    <dialog
      ref="dialog"
      class="modal"
      @close="$emit('closed')"
      @click="onClick"
    >
      <div class="modal__content">
        <slot name="content"></slot>
      </div>

      <form method="dialog">
        <button class="modal__close" autofocus>
          <CloseIcon class="modal__close-icon" />
        </button>
      </form>
    </dialog>
  </div>
</template>

<style lang="scss">
.modal-button {
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid white;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  padding: 6px 8px;
  margin: 0 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }

  &__icon {
    fill: currentColor;
    height: 17px;
    width: 17px;
  }
}

.modal {
  background: none;
  border: none;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 16px;
  max-height: 95svh;
  max-width: calc(100vw - 16px);
  min-height: 50vh;
  min-width: 50vh;
  overflow: hidden;
  position: relative;
  padding: 0;
  cursor: pointer;

  &[open] {
    display: flex;
  }

  &__content {
    background: #fff;
    padding: 32px;
    border-radius: 32px;
    overflow-y: auto;
    flex-grow: 1;
    cursor: auto;
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
