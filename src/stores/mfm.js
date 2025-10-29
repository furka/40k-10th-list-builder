import { defineStore } from 'pinia';
import { parse } from '../utils/data-reader';
import deepFreeze from 'deep-freeze';

import MFM29 from "../data/munitorum-field-manual/MFM2.9.txt?raw";
import MFM32 from "../data/munitorum-field-manual/MFM3.2.txt?raw";
import MFM33 from "../data/munitorum-field-manual/MFM3.3.txt?raw";
import MFM34 from "../data/munitorum-field-manual/MFM3.4.txt?raw";
import MFM35 from "../data/munitorum-field-manual/MFM3.5.txt?raw";

export const useMfmStore = defineStore('mfm', () => {
  const MFM = {};

  const imports = [MFM29, MFM32, MFM33, MFM34, MFM35];

  imports.forEach((mod) => {
    const { FACTIONS, DATA_SHEETS, MFM_VERSION } = parse(mod);
    MFM[MFM_VERSION] = { FACTIONS, DATA_SHEETS, MFM_VERSION };

    if (!MFM.CURRENT) {
      MFM.CURRENT = MFM[MFM_VERSION];
    } else if (MFM_VERSION > MFM.CURRENT.MFM_VERSION) {
      MFM.CURRENT = MFM[MFM_VERSION];
    }

    if (!MFM.PREVIOUS) {
      MFM.PREVIOUS = MFM[MFM_VERSION];
    } else if (
      MFM_VERSION > MFM.PREVIOUS.MFM_VERSION &&
      MFM_VERSION < MFM.CURRENT.MFM_VERSION
    ) {
      MFM.PREVIOUS = MFM[MFM_VERSION];
    }
  });

  deepFreeze(MFM);

  function getVersion(versionKey) {
    return MFM[versionKey] ?? null;
  }

  function getPreviousMFM(currentMFM) {
    if (!currentMFM) {
      return null;
    }

    const versions = Object.keys(MFM)
      .filter((key) => key.startsWith("VERSION"))
      .sort();

    const currentVersionKey = currentMFM.MFM_VERSION;
    const currentIndex = versions.indexOf(currentVersionKey);

    return currentIndex > 0 ? MFM[versions[currentIndex - 1]] : null;
  }

  function getPoints(unit, mfm) {
    if (!mfm) {
      mfm = MFM.CURRENT;
    }
    if (!mfm || !mfm.DATA_SHEETS) {
      return -1;
    }

    const data_sheet = mfm.DATA_SHEETS.find((d) => d.name === unit.name);
    let option;

    if (!data_sheet) {
      return -1;
    }

    if (unit.optionName) {
      option = data_sheet.sizes.find((s) => s.name === unit.optionName.trim());
    } else if (unit.models) {
      option = data_sheet.sizes.find((s) => s.models === unit.models);
    }

    if (option) {
      return option.points;
    }

    return -1;
  }

  function getUnitPointsDifference(unit, currentMFM, previousMFM) {
    if (!currentMFM) {
      currentMFM = MFM.CURRENT;
    }
    if (!previousMFM) {
      previousMFM = MFM.PREVIOUS;
    }

    const currentUnitPoints = getPoints(unit, currentMFM);
    const previousUnitPoints = getPoints(unit, previousMFM);

    if (currentUnitPoints === -1 || previousUnitPoints === -1) {
      return 0;
    }

    return currentUnitPoints - previousUnitPoints;
  }

  function hasInvalidMFM(list) {
    const version = list.mfm_version;
    return !version || !MFM[version];
  }

  function autoUpgradeMFMVersion(list) {
    if (hasInvalidMFM(list)) {
      return;
    }

    if (!changes(list).length) {
      list.mfm_version = MFM.CURRENT.MFM_VERSION;
    }
  }

  function changes(list) {
    return list.units
      .map((u) => {
        const listMFM = MFM[list.mfm_version] || MFM.CURRENT;
        const oldPoints = getPoints(u, listMFM);
        const newPoints = getPoints(u, MFM.CURRENT);
        const pointsDiff = getUnitPointsDifference(u, MFM.CURRENT, listMFM);

        return {
          name: u.name,
          old: oldPoints,
          new: newPoints,
          difference: pointsDiff,
          models: u.models,
          optionName: u.optionName,
        };
      })
      .filter((i) => i.new !== i.old);
  }

  function isListOutdated(list) {
    return hasInvalidMFM(list) || changes(list).length > 0;
  }

  return {
    MFM,
    getVersion,
    getPreviousMFM,
    getPoints,
    getUnitPointsDifference,
    hasInvalidMFM,
    autoUpgradeMFMVersion,
    changes,
    isListOutdated,
  };
});
