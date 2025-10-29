<script setup>
import { computed } from "vue";
import { getPoints } from "../utils/mfm";
import ViewListModal from "./ViewListModal.vue";
import OpenListModal from "./OpenListModal.vue";
import NewIcon from "../assets/file-line-icon.svg";
import ToolBar from "./ToolBar.vue";
import ShareListModal from "./ShareListModal.vue";

const props = defineProps({
  appData: Object,
});

defineEmits(['newList', 'select-list', 'copy-list', 'delete-list']);

const points = computed(() => {
  return props.appData.currentList.units.reduce((acc, curr) => {
    const unitPoints = getPoints(curr, props.appData.currentMFM);
    return acc + (unitPoints > 0 ? unitPoints : 0);
  }, 0);
});
</script>

<template>
  <ToolBar class="app-toolbar">
    <div class="toolbar__group toolbar__group--points">
      <label :class="{ 'label--static': props.appData.isBoardingActions }">
        <span :class="{ over: points > props.appData.effectiveMaxPoints }">
          {{ points }}
        </span>
        /
        <span v-if="props.appData.isBoardingActions">{{
          props.appData.effectiveMaxPoints
        }}</span>
        <input
          v-else
          type="number"
          min="500"
          step="500"
          v-model.number="props.appData.currentList.maxPoints"
          class="toolbar__points-input"
          :style="{
            width:
              Math.max(
                3,
                props.appData.currentList.maxPoints.toString().length + 1
              ) + 'ch',
          }"
        />
      </label>
    </div>

    <div class="toolbar__group">
      <ViewListModal
        :current-m-f-m="props.appData.currentMFM"
        :current-list="props.appData.currentList"
        :detachment-display-name="props.appData.detachmentDisplayName"
      />
      <ShareListModal :current-list="props.appData.currentList" />
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
      <button
        class="toolbar__button"
        @click="$emit('newList')"
        title="Create a new army list"
      >
        <NewIcon class="toolbar__icon" />
        <span>New</span>
      </button>
      <OpenListModal
        :current-list="props.appData.currentList"
        :saved-lists="props.appData.lists"
        @select-list="$emit('select-list', $event)"
        @copy-list="$emit('copy-list', $event)"
        @delete-list="$emit('delete-list', $event)"
      />
    </div>
  </ToolBar>
</template>

<style scoped lang="scss">
.app-toolbar {
  .toolbar {
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
        min-width: 250px;

        label {
          margin-left: auto;
          cursor: pointer;
        }

        .label--static {
          cursor: default;
        }

        .over {
          color: #ff0000;
        }
      }
    }
  }
}
</style>
