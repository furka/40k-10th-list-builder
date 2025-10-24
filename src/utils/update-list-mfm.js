import { MFM } from "./mfm";

function getPoints(unit, mfm = MFM.CURRENT) {
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

console.log(MFM);

// get the difference in points for a unit between two MFM versions
export function getUnitPointsDifference(
  unit,
  currentMFM = MFM.CURRENT,
  previousMFM = MFM.PREVIOUS
) {
  const currentUnitPoints = getPoints(unit, currentMFM);
  const previousUnitPoints = getPoints(unit, previousMFM);

  if (currentUnitPoints === -1 || previousUnitPoints === -1) {
    return 0;
  }

  return currentUnitPoints - previousUnitPoints;
}

// Automatically upgrade the MFM version if there are no changes
export function autoUpgradeMFMVersion(list) {
  if (!changes(list).length) {
    list.mfm_version = MFM.CURRENT.MFM_VERSION;
  }
}

// Upgrade the list to the current MFM version, changing unit points as
// necessary and marking units with errors if they cannot be found
export function upgradeMFMVersion(list, mfm = MFM.CURRENT) {
  if (list.mfm_version === mfm.MFM_VERSION) {
    return; // already using the correct version
  }

  try {
    list.units.forEach((unit) => {
      const points = getPoints(unit, mfm);

      if (points < 0) {
        unit.error = true;
      } else {
        unit.points = points;
      }
    });

    list.mfm_version = mfm.MFM_VERSION;
  } catch (e) {
    console.error(`Failed to upgrade list to ${mfm.MFM_VERSION}`, e);
  }
}

export function changes(list) {
  return list.units
    .map((u) => {
      const pointsDiff = getUnitPointsDifference(
        u,
        MFM.CURRENT,
        MFM[list.mfm_version]
      );

      return {
        name: u.name,
        old: u.points,
        new: getPoints(u, MFM.CURRENT),
        difference: pointsDiff,
        models: u.models,
        optionName: u.optionName,
      };
    })
    .filter((i) => i.new !== i.old);
}
