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

export const sortListPoints = function (a, b) {
  return a.points < b.points ? 1 : a.points > b.points ? -1 : 0;
};
