import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useMfmStore } from './mfm';
import { useAppStore } from './app';
import { nameEquals, normalizeString } from '../utils/name-match';
import unitNameAliases from '../data/configs/unit-name-aliases.json';
import {
  sortDataSheetAlphabetical,
  sortDataSheetPtsAscending,
  sortDataSheetPtsDescending,
} from '../utils/sort-functions';
import { SORT_CHEAPEST_FIRST, SORT_EXPENSIVE_FIRST } from '../data/constants';
import { BOARDING_ACTIONS } from '../data/configs';
import { isBoardingActionsDetachment } from '../utils/boarding-actions';

export const useCodexStore = defineStore('codex', () => {
  const mfmStore = useMfmStore();
  const appStore = useAppStore();

  // Store faction, subFaction, and detachment as refs
  const faction = ref(null);
  const subFaction = ref(null);
  const detachment = ref(null);
  const currentMFM = ref(null);

  // Get the full compendium from current MFM
  const compendium = computed(() => {
    return (currentMFM.value || mfmStore.MFM.CURRENT).DATA_SHEETS;
  });

  // Fast lookup map indexed by normalized unit name
  // Returns object with: { factionMap, allUnitsMap }
  // factionMap prioritizes current faction, allUnitsMap is fallback
  const compendiumByName = computed(() => {
    const factionMap = new Map();
    const allUnitsMap = new Map();

    compendium.value.forEach((sheet) => {
      const normalizedName = normalizeString(sheet.name);
      const isCurrentFaction = sheet.faction === faction.value || sheet.faction === subFaction.value;

      // Add to faction map if it's current faction
      if (isCurrentFaction) {
        factionMap.set(normalizedName, sheet);
      }

      // Always add to fallback map (last one wins for duplicates)
      allUnitsMap.set(normalizedName, sheet);

      // Also add entries for all aliases
      const aliases = unitNameAliases[sheet.name];
      if (aliases) {
        aliases.forEach(alias => {
          const normalizedAlias = normalizeString(alias);
          if (isCurrentFaction) {
            factionMap.set(normalizedAlias, sheet);
          }
          allUnitsMap.set(normalizedAlias, sheet);
        });
      }
    });

    return { factionMap, allUnitsMap };
  });

  // Get filtered compendium based on faction, subfaction, detachment, and UI filters
  const filteredCompendium = computed(() => {
    let sheets = compendium.value.filter((unit) => {
      const factionMatch = unit.faction === faction.value || unit.faction === subFaction.value;

      // If no detachment or unit has no detachment, just use faction match
      if (!detachment.value || !unit.detachment) {
        return factionMatch;
      }

      // For boarding actions, also check detachment match
      const detachmentMatch = unit.detachment?.toLowerCase() === detachment.value?.toLowerCase();

      return factionMatch && detachmentMatch;
    });

    // Apply boarding actions filtering
    const isBoardingActions = detachment.value && isBoardingActionsDetachment(detachment.value);
    if (isBoardingActions) {
      const config = BOARDING_ACTIONS[faction.value]?.[detachment.value];
      if (config?.units) {
        // Build a lookup map for boarding actions units, including aliases
        const unitConfigMap = new Map();
        config.units.forEach(slot => {
          slot.options.forEach(option => {
            const normalizedOptionName = normalizeString(option.name);
            unitConfigMap.set(normalizedOptionName, option);
          });
        });

        sheets = sheets
          .map(sheet => {
            const normalizedSheetName = normalizeString(sheet.name);
            let unitConfig = unitConfigMap.get(normalizedSheetName);

            // If not found, check if any aliases match
            if (!unitConfig) {
              const aliases = unitNameAliases[sheet.name];
              if (aliases) {
                for (const alias of aliases) {
                  unitConfig = unitConfigMap.get(normalizeString(alias));
                  if (unitConfig) break;
                }
              }
            }

            if (!unitConfig) {
              return null;
            }

            if (!unitConfig.models) {
              return sheet;
            }

            const filteredSizes = sheet.sizes.filter(size =>
              unitConfig.models.includes(size.models)
            );

            return {
              ...sheet,
              sizes: filteredSizes.length > 0 ? filteredSizes : sheet.sizes
            };
          })
          .filter(sheet => sheet !== null);
      } else {
        sheets = [];
      }
    }

    // Apply user text filter
    if (appStore.codexFilter) {
      sheets = sheets.filter((sheet) =>
        sheet.name.toLowerCase().includes(appStore.codexFilter.toLowerCase())
      );
    }

    // Apply Forge World filter
    if (!appStore.showForgeWorld) {
      sheets = sheets.filter((sheet) => !sheet.forgeWorld);
    }

    // Apply Legends filter
    if (!appStore.showLegends) {
      sheets = sheets.filter((sheet) => !sheet.legends);
    }

    // Apply sort order
    if (appStore.sortOrder === SORT_EXPENSIVE_FIRST) {
      sheets = [...sheets].sort(sortDataSheetPtsDescending);
    } else if (appStore.sortOrder === SORT_CHEAPEST_FIRST) {
      sheets = [...sheets].sort(sortDataSheetPtsAscending);
    } else {
      sheets = [...sheets].sort(sortDataSheetAlphabetical);
    }

    return sheets;
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

    const currentDetachment = detachment.value?.toLowerCase();

    return {
      name: enhancementsSheet.name,
      sizes: enhancementsSheet.sizes.filter((s) => {
        return s.detachment?.toLowerCase() === currentDetachment;
      }),
      enhancements: true,
    };
  });

  // Method to update faction/subfaction/detachment
  function setFaction(newFaction) {
    faction.value = newFaction;
  }

  function setSubFaction(newSubFaction) {
    subFaction.value = newSubFaction;
  }

  function setDetachment(newDetachment) {
    detachment.value = newDetachment;
  }

  function setCurrentMFM(mfm) {
    currentMFM.value = mfm;
  }

  function getDataSheet(unitName) {
    // Special case for enhancements - return the enhancements computed
    if (nameEquals(unitName, "Enhancements")) {
      return enhancements.value;
    }

    const normalized = normalizeString(unitName);
    // Try faction map first (prioritizes current faction), then fall back to all units
    return compendiumByName.value.factionMap.get(normalized) ||
           compendiumByName.value.allUnitsMap.get(normalized);
  }

  return {
    faction,
    subFaction,
    detachment,
    currentMFM,
    compendium,
    compendiumByName,
    filteredCompendium,
    enhancements,
    setFaction,
    setSubFaction,
    setDetachment,
    setCurrentMFM,
    getDataSheet,
  };
});
