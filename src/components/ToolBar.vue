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
  padding: 2px;
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

  &__group {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    font-size: var(--font-size);
    justify-content: flex-end;
    margin-inline: 8px;
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
