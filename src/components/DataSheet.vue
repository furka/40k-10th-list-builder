<script setup>
import { computed } from "vue";
const props = defineProps({
  dataSheet: Object,
  appData: Object,
});

const count = computed(() => {
  return props.appData.units.filter(
    (unit) => unit.name === props.dataSheet.name
  ).length;
});

const maxed = computed(() => {
  if (props.dataSheet["epic-hero"]) {
    return count.value >= 1;
  }
  if (props.dataSheet["battle-line"]) {
    return count.value >= 6;
  }
  return count.value >= 3;
});
</script>

<template>
  <div class="data-sheet" :class="{ maxed: maxed }">
    <div class="data-sheet__title">{{ props.dataSheet.name }}</div>
    <ul>
      <li
        v-for="(option, index) in props.dataSheet.sizes"
        @click="!maxed ? $emit('add', props.dataSheet, option) : null"
      >
        <span
          >{{ option.models }}
          {{ option.models === 1 ? "model" : "models" }}</span
        >
        <span class="data-sheet__option-spacer"></span>
        <span>{{ option.points }} pts</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.data-sheet {
  margin-bottom: 1px;
  width: 250px;
  writing-mode: horizontal-tb;
}

.maxed {
  opacity: 0.5;
}
.data-sheet__title {
  background-color: rgba(0, 0, 0, 0.65);
  color: #fff;
  padding: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: bold;
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border: 2px solid transparent;
  border-radius: 3px;
  padding: 2px;
  cursor: pointer;
}
li:hover {
  border-color: black;
}
.data-sheet__option-spacer {
  border-bottom: 2px dotted black;
  flex-grow: 1;
  margin: 4px 2px;
}
</style>
