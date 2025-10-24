<script setup>
import { computed } from "vue";
import { MFM, changes } from "../utils/mfm";
import PACKAGE from "../../package.json";
import RiskIcon from "../assets/risk-icon.svg";

const props = defineProps({
  appData: Object,
});

const availableMFMVersions = computed(() => {
  return Object.keys(MFM)
    .filter((key) => key.startsWith("VERSION"))
    .sort()
    .reverse();
});

const hasChanges = computed(() => {
  return changes(props.appData.currentList).length > 0;
});
</script>

<template>
  <div class="version-bar">
    <div class="version-bar__mfm">
      <label>
        Munitorum Field Manual
        <select v-model="appData.currentList.mfm_version">
          <option
            v-for="version in availableMFMVersions"
            :key="version"
            :value="version"
          >
            {{ version.toLowerCase() }}
          </option>
        </select>
      </label>
      <span
        v-if="hasChanges"
        class="version-bar__warning"
        title="This list has point changes compared to the latest MFM version. Change the MFM version to the left to update."
      >
        <RiskIcon class="version-bar__warning-icon" />
        <span>New Version Available</span>
      </span>
    </div>
    <span>app version {{ PACKAGE.version }}</span>
  </div>
</template>

<style scoped lang="scss">
.version-bar {
  height: 20px;
  background-color: #222;
  color: #999;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 8px;
  border-top: 1px solid #333;
  box-sizing: border-box;

  &__mfm {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  span {
    white-space: nowrap;
  }

  label {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  select {
    background-color: #333;
    border: 1px solid #555;
    border-radius: 2px;
    color: #999;
    font-size: 11px;
    padding: 0 4px;
    cursor: pointer;

    &:hover {
      background-color: #444;
    }
  }

  &__warning {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #f59e0b;
    font-weight: 600;
    cursor: help;

    &-icon {
      height: 16px;
      width: 16px;
      flex-shrink: 0;
    }
  }
}
</style>
