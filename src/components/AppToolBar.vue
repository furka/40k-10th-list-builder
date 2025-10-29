<script setup>
import { computed } from "vue";
import ViewListModal from "./ViewListModal.vue";
import OpenListModal from "./OpenListModal.vue";
import NewIcon from "../assets/file-line-icon.svg";
import ToolBar from "./ToolBar.vue";
import ShareListModal from "./ShareListModal.vue";
import { useArmyListStore } from "../stores/armyList";
import { useMfmStore } from "../stores/mfm";

const armyListStore = useArmyListStore();
const mfmStore = useMfmStore();

const props = defineProps({
  savedLists: Array,
  detachmentDisplayName: String,
});

const emit = defineEmits([
  'newList',
  'select-list',
  'copy-list',
  'delete-list',
  'set-max-points',
  'set-list-name',
]);

const points = computed(() => {
  return armyListStore.units.reduce((acc, curr) => {
    const unitPoints = mfmStore.getPoints(curr, armyListStore.currentMFM);
    return acc + (unitPoints > 0 ? unitPoints : 0);
  }, 0);
});
</script>

<template>
  <ToolBar class="app-toolbar">
    <div class="toolbar__group toolbar__group--points">
      <label :class="{ 'label--static': armyListStore.isBoardingActions }">
        <span :class="{ over: points > armyListStore.effectiveMaxPoints }">
          {{ points }}
        </span>
        /
        <span v-if="armyListStore.isBoardingActions">{{
          armyListStore.effectiveMaxPoints
        }}</span>
        <input
          v-else
          type="number"
          min="500"
          step="500"
          :value="armyListStore.maxPoints"
          @input="emit('set-max-points', parseInt($event.target.value))"
          class="toolbar__points-input"
          :style="{
            width:
              Math.max(
                3,
                armyListStore.maxPoints.toString().length + 1
              ) + 'ch',
          }"
        />
      </label>
    </div>

    <div class="toolbar__group">
      <ViewListModal
        :detachment-display-name="props.detachmentDisplayName"
      />
      <ShareListModal />
    </div>

    <div class="toolbar__group toolbar__group--list-name">
      <input
        type="text"
        :value="armyListStore.name"
        @input="emit('set-list-name', $event.target.value)"
        placeholder="Name your list"
        class="toolbar__list-name"
      />
    </div>

    <div class="toolbar__group">
      <button
        class="toolbar__button"
        @click="emit('newList')"
        title="Create a new army list"
      >
        <NewIcon class="toolbar__icon" />
        <span>New</span>
      </button>
      <OpenListModal
        :saved-lists="props.savedLists"
        @select-list="emit('select-list', $event)"
        @copy-list="emit('copy-list', $event)"
        @delete-list="emit('delete-list', $event)"
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
