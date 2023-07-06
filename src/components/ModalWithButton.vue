<script setup>
import { ref } from "vue";
import CloseIcon from "../assets/close-line-icon.svg";

const dialog = ref(null);

function openDialog() {
  dialog.value.showModal();
}
</script>

<template>
  <div>
    <button class="modal-button" @click="openDialog">
      <slot name="button"></slot>
    </button>

    <dialog ref="dialog" class="modal">
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
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &__icon {
    fill: currentColor;
    height: 23px;
    width: 23px;
  }
}

.modal {
  border-radius: 32px;
  border: none;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 16px;
  max-height: 95svh;
  max-width: calc(100vw - 16px);
  min-height: 50vh;
  min-width: 50vh;
  overflow: hidden;
  padding: 32px;
  position: relative;

  &[open] {
    display: flex;
  }

  &__content {
    overflow-y: auto;
    flex-grow: 1;
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
