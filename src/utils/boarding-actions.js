import { BOARDING_ACTIONS } from "../data/configs";
import { nameEquals } from "./name-match";
import { boardingActionsExceptions } from "./boarding-actions-exceptions";
import { useArmyListStore } from "../stores/armyList";
import { useCodexStore } from "../stores/codex";

function findDetachmentConfig(detachment) {
  for (const factionName in BOARDING_ACTIONS) {
    const factionConfig = BOARDING_ACTIONS[factionName];
    if (factionConfig[detachment]) {
      return factionConfig[detachment];
    }
  }
  return null;
}

function findBoardingActionsSlot(unitName, detachment) {
  const detachmentConfig = findDetachmentConfig(detachment);

  if (detachmentConfig?.units) {
    for (const slot of detachmentConfig.units) {
      const unitConfig = slot.options.find((opt) =>
        nameEquals(opt.name, unitName)
      );
      if (unitConfig) {
        return slot;
      }
    }
  }

  return null;
}

function getSlotMaxAllowed(slot) {
  const armyListStore = useArmyListStore();
  const codexStore = useCodexStore();

  if (slot.exception && boardingActionsExceptions[slot.exception]) {
    const currentList = { units: armyListStore.units };
    return boardingActionsExceptions[slot.exception].validate(
      slot,
      codexStore.detachment,
      currentList,
      codexStore.filteredCompendium
    );
  }
  return slot.max || 1;
}

export function isBoardingActionsDetachment(detachment) {
  for (const factionName in BOARDING_ACTIONS) {
    const factionConfig = BOARDING_ACTIONS[factionName];
    if (factionConfig[detachment]) {
      return true;
    }
  }
  return false;
}

export function getBoardingActionsDisplayName(detachment) {
  for (const factionName in BOARDING_ACTIONS) {
    const factionConfig = BOARDING_ACTIONS[factionName];
    if (factionConfig[detachment]) {
      return factionConfig[detachment].displayName || detachment;
    }
  }
  return detachment;
}

export function getBoardingActionsMax(option) {
  const armyListStore = useArmyListStore();
  const codexStore = useCodexStore();

  const isEnhancement = option.enhancement ||
    option.name === "Enhancements" ||
    option.name === "Detachment Enhancements" ||
    option.name === "Generic Enhancements" ||
    option.name === "Breaching Operation Enhancements";

  if (isEnhancement) {
    const nonEpicCharacterCount = armyListStore.units.filter((u) => {
      const isEnhancementUnit = u.name === "Enhancements" ||
        u.name === "Detachment Enhancements" ||
        u.name === "Generic Enhancements" ||
        u.name === "Breaching Operation Enhancements";
      if (isEnhancementUnit) return false;

      const datasheet = codexStore.filteredCompendium.find((ds) => nameEquals(ds.name, u.name));
      return datasheet?.character === true && datasheet?.epicHero !== true;
    }).length;
    return Math.min(2, nonEpicCharacterCount);
  }

  const slot = findBoardingActionsSlot(option.name, codexStore.detachment);
  if (!slot) return 0;

  const maxAllowed = getSlotMaxAllowed(slot);

  if (slot.duplicates === false) {
    return Math.min(1, maxAllowed);
  }

  return maxAllowed;
}

export function isBoardingActionsSlotFull(unitName) {
  const armyListStore = useArmyListStore();
  const codexStore = useCodexStore();

  const slot = findBoardingActionsSlot(unitName, codexStore.detachment);
  if (!slot) return false;

  const slotMax = getSlotMaxAllowed(slot);
  const slotUnitNames = slot.options.map((opt) => opt.name);

  const unitsInSlot = armyListStore.units.filter((unit) =>
    slotUnitNames.some((slotName) => nameEquals(slotName, unit.name))
  );

  return unitsInSlot.length >= slotMax;
}

export function getBoardingActionsErrorMessage(unitName) {
  const codexStore = useCodexStore();

  const slot = findBoardingActionsSlot(unitName, codexStore.detachment);
  if (!slot) {
    return "Unit not available in this Detachment";
  }

  if (slot.exception && boardingActionsExceptions[slot.exception]) {
    return boardingActionsExceptions[slot.exception].getMessage(slot);
  }

  const slotMax = slot.max || 1;
  const optionsText = slot.options
    .map((opt) => {
      const sizesText = opt.models
        ? ` (${opt.models.join(" or ")} models)`
        : "";
      return "• " + opt.name + sizesText;
    })
    .join("\n");

  const duplicatesText =
    slot.duplicates === false ? " (duplicates are not allowed)" : "";
  const unitsText = slot.options.length === 1 ? "unit" : "following units";
  return `You can include up to ${slotMax} of the ${unitsText}${duplicatesText}:\n${optionsText}`;
}
