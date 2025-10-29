import { nameEquals } from "./name-match";

export const sortDataSheetAlphabetical = function (a, b) {
  a = a.name.toLowerCase();
  b = b.name.toLowerCase();
  return a < b ? -1 : a > b ? 1 : 0;
};

export const sortDataSheetPtsDescending = function (a, b) {
  a = getMostExpensiveOption(a.sizes);
  b = getMostExpensiveOption(b.sizes);
  return a < b ? 1 : a > b ? -1 : 0;
};

export const sortDataSheetPtsAscending = function (a, b) {
  a = getCheapestOption(a.sizes);
  b = getCheapestOption(b.sizes);
  return a < b ? -1 : a > b ? 1 : 0;
};

function getMostExpensiveOption(sizes) {
  return Math.max(...sizes.filter((s) => !s.bonus).map((s) => s.points));
}

function getCheapestOption(sizes) {
  return Math.min(...sizes.filter((s) => !s.bonus).map((s) => s.points));
}

export const sortOptionsPtsDescending = function (a, b) {
  a = a.bonus ? 0 : a.points;
  b = b.bonus ? 0 : b.points;
  return a < b ? 1 : a > b ? -1 : 0;
};

export const sortListPoints = function (mfmStore, currentMFM, ascending = false) {
  return function (a, b) {
    const aPoints = mfmStore.getPoints(a, currentMFM);
    const bPoints = mfmStore.getPoints(b, currentMFM);

    if (aPoints === bPoints) {
      return sortDataSheetAlphabetical(a, b);
    }

    return ascending
      ? aPoints < bPoints ? -1 : 1
      : aPoints < bPoints ? 1 : -1;
  };
};

export const sortListByRole = function (compendium) {
  return function (a, b) {
    const getDataSheet = (unitName) => {
      return compendium.find((ds) => nameEquals(ds.name, unitName));
    };

    const getRolePriority = (unit) => {
      const dataSheet = getDataSheet(unit.name);
      if (!dataSheet) return 5;

      if (dataSheet.character || dataSheet.epicHero) return 1;
      if (nameEquals(unit.name, "Enhancements")) return 2;
      if (dataSheet.battleLine) return 3;
      if (dataSheet.dedicatedTransport) return 4;
      if (dataSheet.allies) return 6;
      if (dataSheet.forgeWorld) return 7;
      if (dataSheet.fortification) return 8;
      return 5;
    };

    const priorityA = getRolePriority(a);
    const priorityB = getRolePriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return sortDataSheetAlphabetical(a, b);
  };
};
