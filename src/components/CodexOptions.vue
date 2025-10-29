<script setup>
import DropDown from "./DropDown.vue";
import OptionsIcon from "../assets/setting-line-icon.svg";
import {
  SORT_ALPHABETICAL,
  SORT_CHEAPEST_FIRST,
  SORT_EXPENSIVE_FIRST,
  GROUP_NONE,
  GROUP_ROLE,
} from "../data/constants";

const props = defineProps({
  showPointsChanges: Boolean,
  showForgeWorld: Boolean,
  showLegends: Boolean,
  editCollection: Boolean,
  sortOrder: String,
  group: String,
});

const emit = defineEmits([
  'set-show-points-changes',
  'set-show-forge-world',
  'set-show-legends',
  'set-edit-collection',
  'set-sort-order',
  'set-group',
]);
</script>

<template>
  <DropDown class="codex-options" position="right" title="Codex display options">
    <template v-slot:button>
      <OptionsIcon class="dropdown__icon" />
      <span>Options</span>
    </template>
    <template v-slot:content>
      <div class="codex-options__content">
        <label title="Show points changes compared to previous MFM">
          <input
            type="checkbox"
            :checked="props.showPointsChanges"
            @change="emit('set-show-points-changes', $event.target.checked)"
          />
          Points Changes
        </label>

        <label title="Show Forge World units">
          <input
            type="checkbox"
            :checked="props.showForgeWorld"
            @change="emit('set-show-forge-world', $event.target.checked)"
          />
          Forge World
        </label>

        <label title="Show Legends units">
          <input
            type="checkbox"
            :checked="props.showLegends"
            @change="emit('set-show-legends', $event.target.checked)"
          />
          Legends
        </label>

        <label
          title="Set which units are available in your personal collection"
        >
          <input
            type="checkbox"
            :checked="props.editCollection"
            @change="emit('set-edit-collection', $event.target.checked)"
          />
          Edit Collection
        </label>

        <label title="Sort Datasheets">
          Sort:
          <select
            :value="props.sortOrder"
            @change="emit('set-sort-order', $event.target.value)"
          >
            <option>{{ SORT_ALPHABETICAL }}</option>
            <option>{{ SORT_CHEAPEST_FIRST }}</option>
            <option>{{ SORT_EXPENSIVE_FIRST }}</option>
          </select>
        </label>

        <label title="Group Datasheets">
          Group:
          <select
            :value="props.group"
            @change="emit('set-group', $event.target.value)"
          >
            <option>{{ GROUP_NONE }}</option>
            <option>{{ GROUP_ROLE }}</option>
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

  select {
    flex-grow: 1;
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
