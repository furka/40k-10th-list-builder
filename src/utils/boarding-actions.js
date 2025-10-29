import { BOARDING_ACTIONS } from "../data/configs";
import { nameEquals } from "./name-match";
import { boardingActionsExceptions } from "./boarding-actions-exceptions";
import { useArmyListStore } from "../stores/armyList";
import { storeToRefs } from "pinia";

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

function getSlotMaxAllowed(slot, compendium) {
  if (slot.exception && boardingActionsExceptions[slot.exception]) {
    const store = useArmyListStore();
    const { units, detachment } = storeToRefs(store);
    const currentList = { units: units.value };
    return boardingActionsExceptions[slot.exception].validate(
      slot,
      detachment.value,
      currentList,
      compendium
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

export function getBoardingActionsMax(
  option,
  compendium
) {
  const store = useArmyListStore();
  const { units, detachment } = storeToRefs(store);

  const isEnhancement = option.enhancement ||
    option.name === "Enhancements" ||
    option.name === "Detachment Enhancements" ||
    option.name === "Generic Enhancements" ||
    option.name === "Breaching Operation Enhancements";

  if (isEnhancement) {
    const nonEpicCharacterCount = units.value.filter((u) => {
      const isEnhancementUnit = u.name === "Enhancements" ||
        u.name === "Detachment Enhancements" ||
        u.name === "Generic Enhancements" ||
        u.name === "Breaching Operation Enhancements";
      if (isEnhancementUnit) return false;

      const datasheet = compendium.find((ds) => nameEquals(ds.name, u.name));
      return datasheet?.character === true && datasheet?.epicHero !== true;
    }).length;
    return Math.min(2, nonEpicCharacterCount);
  }

  const slot = findBoardingActionsSlot(option.name, detachment.value);
  if (!slot) return 0;

  const maxAllowed = getSlotMaxAllowed(slot, detachment, compendium);

  if (slot.duplicates === false) {
    return Math.min(1, maxAllowed);
  }

  return maxAllowed;
}

export function isBoardingActionsSlotFull(
  unitName,
  compendium
) {
  const store = useArmyListStore();
  const { units, detachment } = storeToRefs(store);

  const slot = findBoardingActionsSlot(unitName, detachment.value);
  if (!slot) return false;

  const slotMax = getSlotMaxAllowed(slot, compendium);
  const slotUnitNames = slot.options.map((opt) => opt.name);

  const unitsInSlot = units.value.filter((unit) =>
    slotUnitNames.some((slotName) => nameEquals(slotName, unit.name))
  );

  return unitsInSlot.length >= slotMax;
}

export function getBoardingActionsErrorMessage(
  unitName,
  compendium
) {
  const store = useArmyListStore();
  const { detachment } = storeToRefs(store);

  const slot = findBoardingActionsSlot(unitName, detachment.value);
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
