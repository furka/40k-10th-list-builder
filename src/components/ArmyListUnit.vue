<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  unit: Object,
  scale: Number,
  index: Number,
});

const height = computed(() => {
  return `${props.unit.points * props.scale - 1}px`;
});
</script>

<template>
  <div class="army-list-unit" :data-id="props.unit.id">
    <span class="army-list-unit__name"
      >({{ props.unit.models }}) {{ props.unit.name }}
    </span>
  </div>
</template>

<style scoped>
.army-list-unit {
  align-items: center;
  background-color: green;
  display: flex;
  flex-basis: v-bind("height");
  justify-content: center;
  margin-top: 1px;
  position: relative;
  z-index: 1;
  border: 3px solid green;
  cursor: move;
  box-sizing: border-box;
}
.sortable-ghost {
  opacity: 0;
}
.army-list-unit:hover {
  z-index: 2;
}
.army-list-unit__name {
  color: #fff;
  font-family: sans-serif;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
