<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  unit: Object,
  scale: Number,
  index: Number,
});

const height = computed(() => {
  return `${Math.floor(props.unit.points * props.scale)}px`;
});
</script>

<template>
  <div class="army-list-unit" :data-id="props.unit.id">
    <span class="army-list-unit__name">
      <span v-if="props.unit.models"> ({{ props.unit.models }}) </span>
      {{ props.unit.name }}
      <span v-if="props.unit.optionName">— {{ props.unit.optionName }}</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
.army-list-unit {
  align-items: center;
  background-color: rgb(0 89 46);
  border: 1px solid black;
  box-sizing: border-box;
  cursor: move;
  display: flex;
  flex-basis: v-bind("height");
  justify-content: flex-start;
  position: relative;
  z-index: 1;

  &:hover {
    z-index: 2;
  }

  &__name {
    color: #fff;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: bold;
    overflow: hidden;
    padding: 0 4px;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.sortable-ghost {
  opacity: 0;
}
</style>
