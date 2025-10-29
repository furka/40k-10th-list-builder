import { defineStore } from 'pinia';
import { computed, ref, watch, reactive } from 'vue';
import { isBoardingActionsDetachment, getBoardingActionsErrorMessage, isBoardingActionsSlotFull } from '../utils/boarding-actions';
import { save, restore } from '../utils/localStorage';
import { useMfmStore } from './mfm';
import { useCodexStore } from './codex';
import { unitMax } from '../utils/unit-max';
import { nameEquals } from '../utils/name-match';

export const useArmyListStore = defineStore('armyList', () => {
  const mfmStore = useMfmStore();
  const codexStore = useCodexStore();
  const name = ref('');
  const faction = ref('');
  const detachment = ref('');
  const subFaction = ref(null);
  const maxPoints = ref(2000);
  const mfm_version = ref('');
  const version = ref('');
  const modifiedDate = ref(Date.now());
  const sortOrder = ref('');
  const units = ref([]);

  const isBoardingActions = computed(() => {
    return isBoardingActionsDetachment(detachment.value);
  });

  const effectiveMaxPoints = computed(() => {
    return isBoardingActions.value ? 500 : maxPoints.value;
  });

  const currentMFM = computed(() => {
    const version = mfm_version.value;
    return mfmStore.getVersion(version);
  });

  const unitCounts = computed(() => {
    const counts = {};
    units.value.forEach((unit) => {
      if (!unit.bonus) {
        counts[unit.name] = (counts[unit.name] || 0) + 1;
      }
    });
    return counts;
  });

  const modelsTaken = computed(() => {
    const taken = {};
    units.value.forEach((unit) => {
      taken[unit.name] = (taken[unit.name] || 0) + (unit.models || 0);
    });
    return taken;
  });

  const enhancementsTaken = computed(() => {
    const taken = new Set();
    units.value.forEach((unit) => {
      if (unit.optionName) {
        taken.add(unit.optionName);
      }
    });
    return taken;
  });

  const totalEnhancementsCount = computed(() => {
    let count = 0;
    units.value.forEach((unit) => {
      const datasheet = codexStore.getDataSheet(unit.name);
      if (datasheet?.enhancements || (!datasheet && unit.optionName && !unit.models)) {
        count++;
      }
    });
    return count;
  });

  const nonEpicCharacterCount = computed(() => {
    let count = 0;
    units.value.forEach((unit) => {
      const datasheet = codexStore.getDataSheet(unit.name);
      if (datasheet?.character && !datasheet?.epicHero) {
        count++;
      }
    });
    return count;
  });


  function getUnitValidationError(unit) {
    if (unit.error) {
      return "Invalid Unit";
    }

    const datasheet = codexStore.getDataSheet(unit.name);

    // Check if this is an enhancement - either by checking the datasheet or by having an optionName but no datasheet
    if (datasheet?.enhancements || (!datasheet && unit.optionName && !unit.models)) {
      const availableEnhancements = codexStore.enhancements.sizes.map((e) => e.name);
      if (!availableEnhancements.includes(unit.optionName)) {
        return "Enhancement not available in this detachment";
      }

      // For boarding actions, check if total enhancements exceed non-epic characters
      if (isBoardingActions.value) {
        if (totalEnhancementsCount.value > nonEpicCharacterCount.value) {
          return "Too many enhancements for number of characters";
        }
      }

      return false;
    }

    const count = unitCounts.value[unit.name] || 0;

    if (!datasheet) {
      const version = currentMFM.value?.MFM_VERSION || "unknown";
      return `Unit not available in MFM ${version}`;
    }

    const max = unitMax(datasheet, isBoardingActions.value);

    if (isBoardingActions.value) {
      if (max === 0) {
        return getBoardingActionsErrorMessage(unit.name);
      }

      if (count > max) {
        return getBoardingActionsErrorMessage(unit.name);
      }

      // Check if this unit violates slot exceptions by checking if the slot
      // would be full WITHOUT this unit. If so, this unit is invalid.
      const unitsExcludingThis = units.value.filter(u => u.id !== unit.id);
      const slotFull = isBoardingActionsSlotFull(unit.name, unitsExcludingThis);

      if (slotFull) {
        return getBoardingActionsErrorMessage(unit.name);
      }
    } else {
      if (count > max) {
        return `Only ${max} of this unit allowed`;
      }
    }

    return false;
  }


  function addUnit(unit) {
    units.value = [unit, ...units.value];
    modifiedDate.value = Date.now();
  }

  function removeUnit(id) {
    units.value = units.value.filter(u => u.id !== id);
    modifiedDate.value = Date.now();
  }

  function setUnits(newUnits) {
    units.value = newUnits;
  }

  function setList(list) {
    name.value = list.name || '';
    faction.value = list.faction || '';
    detachment.value = list.detachment || '';
    subFaction.value = list.subFaction || null;
    maxPoints.value = list.maxPoints || 2000;
    mfm_version.value = list.mfm_version || '';
    version.value = list.version || '';
    modifiedDate.value = list.modifiedDate || Date.now();
    sortOrder.value = list.sortOrder || '';
    units.value = list.units || [];
  }

  function toObject() {
    return {
      name: name.value,
      faction: faction.value,
      detachment: detachment.value,
      subFaction: subFaction.value,
      maxPoints: maxPoints.value,
      mfm_version: mfm_version.value,
      version: version.value,
      modifiedDate: modifiedDate.value,
      sortOrder: sortOrder.value,
      units: units.value,
    };
  }

  function loadFromStorage(defaultList = null) {
    const savedList = restore('currentList');
    if (savedList) {
      setList(savedList);
    } else if (defaultList) {
      setList(defaultList);
    }
  }

  watch(
    () => toObject(),
    (currentList) => {
      save('currentList', currentList);
    },
    { deep: true }
  );

  return {
    name,
    faction,
    detachment,
    subFaction,
    maxPoints,
    mfm_version,
    version,
    modifiedDate,
    sortOrder,
    units,
    unitCounts,
    modelsTaken,
    enhancementsTaken,
    totalEnhancementsCount,
    nonEpicCharacterCount,
    isBoardingActions,
    effectiveMaxPoints,
    currentMFM,
    getUnitValidationError,
    addUnit,
    removeUnit,
    setUnits,
    setList,
    toObject,
    loadFromStorage,
  };
});
