import { BOARDING_ACTIONS } from "../data/configs";
import { nameEquals } from "./name-match";
import { boardingActionsExceptions } from "./boarding-actions-exceptions";

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

function isSlotAvailable(slot, detachment, currentList, compendium) {
  if (slot.exception && boardingActionsExceptions[slot.exception]) {
    return boardingActionsExceptions[slot.exception].validate(
      slot,
      detachment,
      currentList,
      compendium
    );
  }
  return true;
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

export function getBoardingActionsMax(
  option,
  detachment,
  currentList,
  compendium
) {
  if (option.enhancement || option.name === "Enhancements") {
    return 1;
  }

  const slot = findBoardingActionsSlot(option.name, detachment);
  if (!slot) return 0;

  if (!isSlotAvailable(slot, detachment, currentList, compendium)) {
    return 0;
  }

  if (slot.duplicates === false) {
    return 1;
  }
  return slot.max || 1;
}

export function isBoardingActionsSlotFull(
  unitName,
  detachment,
  currentList,
  compendium
) {
  const slot = findBoardingActionsSlot(unitName, detachment);
  if (!slot) return false;

  const slotMax = slot.max || 1;
  const slotUnitNames = slot.options.map((opt) => opt.name);

  const unitsInSlot = currentList.units.filter((unit) =>
    slotUnitNames.some((slotName) => nameEquals(slotName, unit.name))
  );

  return unitsInSlot.length >= slotMax;
}

export function getBoardingActionsErrorMessage(
  unitName,
  detachment,
  currentList,
  compendium
) {
  const slot = findBoardingActionsSlot(unitName, detachment);
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
