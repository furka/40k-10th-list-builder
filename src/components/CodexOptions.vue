<script setup>
import DropDown from "./DropDown.vue";
import OptionsIcon from "../assets/setting-line-icon.svg";
import {
  SORT_ALPHABETICAL,
  SORT_CHEAPEST_FIRST,
  SORT_EXPENSIVE_FIRST,
} from "../data/constants";

const props = defineProps({
  appData: Object,
});
</script>

<template>
  <DropDown class="codex-options" position="right">
    <template v-slot:button>
      <OptionsIcon class="dropdown__icon" />
      <span>Options</span>
    </template>
    <template v-slot:content>
      <div class="codex-options__content">
        <label title="Show Forge World units">
          <input type="checkbox" v-model="props.appData.showForgeWorld" />
          Forge World
        </label>

        <label title="Set which units are in your personal collection">
          <input type="checkbox" v-model="props.appData.editCollection" />
          Edit Collection
        </label>

        <label>
          Sort:
          <select v-model="props.appData.sortOrder">
            <option>{{ SORT_ALPHABETICAL }}</option>
            <option>{{ SORT_CHEAPEST_FIRST }}</option>
            <option>{{ SORT_EXPENSIVE_FIRST }}</option>
          </select>
        </label>
      </div>
    </template>
  </DropDown>
</template>

<style scoped lang="scss">
.codex-options {
  &__content {
    padding: 0;
  }

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
    padding: 8px 16px;
  }

  label + label {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style>
