<script setup>
import { computed } from "vue";
import { MFM_VERSION } from "../utils/data-reader";
import ViewListModal from "./ViewListModal.vue";
import OpenListModal from "./OpenListModal.vue";
import NewIcon from "../assets/file-line-icon.svg";
import UpdateMFMPointsModal from "./UpdateMFMPointsModal.vue";
import SortArmyButton from "./SortArmyButton.vue";
import ToolBar from "./ToolBar.vue";

const props = defineProps({
  appData: Object,
});

const points = computed(() => {
  return props.appData.currentList.units.reduce(
    (acc, curr) => acc + curr.points,
    0
  );
});

const outOfDate = computed(() => {
  return props.appData.currentList.mfm_version !== MFM_VERSION;
});
</script>

<template>
  <ToolBar class="app-toolbar">
    <div class="toolbar__group toolbar__group--points">
      <UpdateMFMPointsModal
        class="toolbar__warning"
        v-if="outOfDate"
        :app-data="props.appData"
      />
      <SortArmyButton :app-data="props.appData" />
      <label>
        <span :class="{ over: points > props.appData.currentList.maxPoints }">
          {{ points }}
        </span>
        /
        <input
          type="number"
          min="500"
          step="500"
          v-model.number="props.appData.currentList.maxPoints"
          class="toolbar__points-input"
        />
      </label>
    </div>

    <div class="toolbar__group">
      <ViewListModal :app-data="props.appData" />
    </div>

    <div class="toolbar__group toolbar__group--list-name">
      <input
        type="text"
        v-model="props.appData.currentList.name"
        placeholder="Name your list"
        class="toolbar__list-name"
      />
    </div>

    <div class="toolbar__group">
      <button class="toolbar__button" @click="$emit('newList')">
        <NewIcon class="toolbar__icon" />
        <span> New List</span>
      </button>
      <OpenListModal :app-data="props.appData" />
    </div>
  </ToolBar>
</template>

<style scoped lang="scss">
.app-toolbar {
  .toolbar {
    &__points-input {
      width: 3em;
    }

    &__list-name {
      width: 100%;
    }

    &__group {
      &--list-name {
        flex-grow: 1;
      }

      &--points {
        display: flex;
        justify-content: space-between;
        min-width: 230px;

        .over {
          color: #ff0000;
        }
      }
    }
  }
}
</style>
