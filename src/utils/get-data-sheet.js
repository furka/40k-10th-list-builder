export const getDataSheet = function (unit, appData) {
  return appData.compendium.find((u) => u.name === unit.name);
};
