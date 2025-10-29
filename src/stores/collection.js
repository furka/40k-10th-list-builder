import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { save, restore } from '../utils/localStorage';

export const useCollectionStore = defineStore('collection', () => {
  const collection = ref({});

  function setCollection(newCollection) {
    collection.value = newCollection;
  }

  function setUnitCount(unitName, count) {
    collection.value[unitName] = count;
  }

  function getUnitCount(unitName) {
    return collection.value[unitName] ?? 999;
  }

  function loadFromStorage() {
    const savedCollection = restore('collection');
    if (savedCollection) {
      collection.value = savedCollection;
    }
  }

  watch(
    collection,
    (newCollection) => {
      save('collection', newCollection);
    },
    { deep: true }
  );

  return {
    collection,
    setCollection,
    setUnitCount,
    getUnitCount,
    loadFromStorage,
  };
});
