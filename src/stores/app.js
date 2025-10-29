import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { save, restore } from '../utils/localStorage';
import { GROUP_ROLE, SORT_MANUAL } from '../data/constants';
import { useArmyListStore } from './armyList';
import { useMfmStore } from './mfm';
import PACKAGE from '../../package.json';

export const useAppStore = defineStore('app', () => {
  // Window dimensions
  const appHeight = ref(window.innerHeight);
  const appWidth = ref(window.innerWidth);

  // UI state
  const codexFilter = ref('');
  const editCollection = ref(false);
  const group = ref(restore('group') ?? GROUP_ROLE);
  const sortOrder = ref(restore('sortOrder') ?? 'A-Z');

  // Toggles
  const showForgeWorld = ref(restore('showForgeWorld') ?? false);
  const showLegends = ref(restore('showLegends') ?? false);
  const showPointsChanges = ref(restore('showPointsChanges') ?? true);

  // Lists and bin
  const lists = ref(restore('lists') ?? []);
  const bin = ref([]);

  // Watch for changes and save to localStorage
  watch(group, (newGroup) => {
    save('group', newGroup);
  });

  watch(sortOrder, (newSortOrder) => {
    save('sortOrder', newSortOrder);
  });

  watch(showForgeWorld, (newValue) => {
    save('showForgeWorld', newValue);
  });

  watch(showLegends, (newValue) => {
    save('showLegends', newValue);
  });

  watch(showPointsChanges, (newValue) => {
    save('showPointsChanges', newValue);
  });

  watch(lists, (newLists) => {
    save('lists', newLists);
  }, { deep: true });

  function setAppDimensions(height, width) {
    appHeight.value = height;
    appWidth.value = width;
  }

  function createNewList(faction, detachment) {
    const mfmStore = useMfmStore();

    return {
      detachment: detachment || mfmStore.MFM.CURRENT.FACTIONS[0].detachments[0].name,
      faction: faction || mfmStore.MFM.CURRENT.FACTIONS[0].name,
      subFaction: null,
      maxPoints: 2000,
      mfm_version: mfmStore.MFM.CURRENT.MFM_VERSION,
      modifiedDate: Date.now(),
      name: "",
      sortOrder: SORT_MANUAL,
      units: [],
      version: PACKAGE.version,
    };
  }

  function newList() {
    const armyListStore = useArmyListStore();
    const faction = armyListStore.faction;
    const detachment = armyListStore.detachment;
    lists.value.unshift(armyListStore.toObject());
    const newListData = createNewList(faction, detachment);
    armyListStore.setList(newListData);
  }

  async function selectList(list) {
    const armyListStore = useArmyListStore();
    const detachment = list.detachment;
    const i = lists.value.indexOf(list);
    lists.value.splice(i, 1);
    lists.value.unshift(armyListStore.toObject());
    armyListStore.setList(list);

    await new Promise((r) => requestAnimationFrame(r));
    armyListStore.detachment = detachment;
  }

  function copyList(list) {
    const armyListStore = useArmyListStore();
    const currentList = armyListStore.toObject();
    let i;
    if (JSON.stringify(list) === JSON.stringify(currentList)) {
      i = 0;
    } else {
      i = lists.value.indexOf(list);
    }
    const clone = JSON.parse(JSON.stringify(list));
    lists.value.splice(i, 0, clone);
  }

  function deleteList(list) {
    const i = lists.value.indexOf(list);
    lists.value.splice(i, 1);
  }

  return {
    appHeight,
    appWidth,
    codexFilter,
    editCollection,
    group,
    sortOrder,
    showForgeWorld,
    showLegends,
    showPointsChanges,
    lists,
    bin,
    setAppDimensions,
    createNewList,
    newList,
    selectList,
    copyList,
    deleteList,
  };
});
