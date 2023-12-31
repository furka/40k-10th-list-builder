<script setup>
import { reactive, ref, computed } from "vue";
import { useDetectOutsideClick } from "../utils/click-outside";

const props = defineProps({
  position: {
    type: String,
    default: "left",
  },
});

const dialog = ref(null);
const component = ref(null);
const button = ref(null);

let refresh = reactive({
  count: 0,
});

async function openDialog() {
  dialog.value.show();
  await new Promise((r) => requestAnimationFrame(r));
  refresh.count += 1;
}

const offset = computed(() => {
  if (props.position === "left") {
    return "initial";
  }

  refresh.count; // this is just here to force a refresh of this computed value

  const offset =
    button.value.getBoundingClientRect().width -
    dialog.value.getBoundingClientRect().width;

  return `${offset}px`;
});

useDetectOutsideClick(component, () => {
  dialog.value.close();
});
</script>

<template>
  <div class="dropdown" ref="component">
    <button class="dropdown__button" @click="openDialog" ref="button">
      <slot name="button"></slot>
    </button>

    <div class="dropdown__positioner">
      <dialog ref="dialog" class="dropdown__container">
        <slot name="content"></slot>
      </dialog>
    </div>
  </div>
</template>

<style lang="scss">
.dropdown {
  position: relative;

  &__button {
    align-items: center;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &__icon {
    fill: currentColor;
    height: 23px;
    width: 23px;
  }

  &__positioner {
    position: absolute;
    top: 44px;
    left: v-bind("offset");
  }

  &__container {
    background-color: white;
    border-radius: 16px;
    border: none;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    flex-direction: column;
    padding: 0;
    width: max-content;

    &[open] {
      display: flex;
    }
  }
}
</style>
