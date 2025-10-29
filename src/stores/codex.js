import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useArmyListStore } from './armyList';
import { useMfmStore } from './mfm';
import { nameEquals } from '../utils/name-match';

export const useCodexStore = defineStore('codex', () => {
  const armyListStore = useArmyListStore();
  const mfmStore = useMfmStore();

  // Get the full compendium from current MFM
  const compendium = computed(() => {
    return (armyListStore.currentMFM || mfmStore.MFM.CURRENT).DATA_SHEETS;
  });

  // Get filtered compendium based on faction and subfaction
  const filteredCompendium = computed(() => {
    return compendium.value.filter(
      (unit) =>
        unit.faction === armyListStore.faction ||
        unit.faction === armyListStore.subFaction
    );
  });

  // Get enhancements filtered by current detachment
  const enhancements = computed(() => {
    const enhancementsSheet = compendium.value.find(
      (sheet) => nameEquals(sheet.name, "Enhancements")
    );

    if (!enhancementsSheet) {
      return {
        name: "Enhancements",
        sizes: [],
        enhancements: true,
      };
    }

    const currentDetachment = armyListStore.detachment?.toLowerCase();

    return {
      name: enhancementsSheet.name,
      sizes: enhancementsSheet.sizes.filter((s) => {
        return s.detachment?.toLowerCase() === currentDetachment;
      }),
      enhancements: true,
    };
  });

  return {
    compendium,
    filteredCompendium,
    enhancements,
  };
});
