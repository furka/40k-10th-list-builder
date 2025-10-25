<script setup>
const props = defineProps({
  appData: Object,
});
</script>

<template>
  <div class="toolbar">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.toolbar {
  --font-size: 28px;
  align-items: center;
  background-color: #333;
  box-sizing: border-box;
  color: white;
  display: flex;
  display: flex;
  flex-direction: row;
  height: 44px;
  justify-content: space-between;
  gap: 4px;
  position: relative;
  z-index: 3;

  input,
  select {
    background-color: transparent;
    border-bottom: 2px dashed white;
    border-left: none;
    border-right: none;
    border-top: none;
    color: currentcolor;
    font-family: var(--font-family);
    font-size: var(--font-size);

    option {
      color: initial;
    }

    &::placeholder {
      color: #aaa;
    }
  }

  &__button {
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
  }

  &__icon {
    fill: currentColor;
    height: 17px;
    width: 17px;
  }

  &__group {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    font-size: var(--font-size);
    justify-content: flex-end;
  }

  input[type="checkbox"] {
    width: 1em;
    height: 1em;
  }

  label {
    align-items: center;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-size: var(--font-size);
  }
}
</style>
