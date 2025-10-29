import { CONFIGS } from "../data/configs";
import { useMfmStore } from "../stores/mfm";

export function migrateListToSubFactionSystem(list) {
  if (!list) return;

  if (list.detachment) {
    list.detachment = list.detachment.toUpperCase();
  }
  if (list.faction) {
    list.faction = list.faction.toUpperCase();
  }

  const parentFaction = CONFIGS["sub-factions"][list.faction];

  if (parentFaction) {
    // This list was created with old system where sub-faction was stored as main faction
    // Migrate: faction="BLOOD ANGELS" -> faction="SPACE MARINES", subFaction="BLOOD ANGELS"
    list.subFaction = list.faction;
    list.faction = parentFaction;
  } else if (list.subFaction === undefined) {
    list.subFaction = null;
  }
}

export function migrateCollection(collection) {
  if (!collection) {
    return {};
  }

  if (Array.isArray(collection)) {
    const obj = {};
    collection.forEach(item => {
      if (item.name && typeof item.owned === 'number' && item.owned !== 999) {
        obj[item.name] = item.owned;
      }
    });
    return obj;
  }

  return collection;
}

export function runAllMigrations(appData, save) {
  const mfmStore = useMfmStore();
  let collectionChanged = false;
  let listsChanged = false;

  // Migrate collection from array to object format
  if (Array.isArray(appData.collection)) {
    appData.collection = migrateCollection(appData.collection);
    collectionChanged = true;
  }

  // Migrate all lists (current list and saved lists)
  [appData.currentList, ...appData.lists].forEach((list) => {
    migrateListToSubFactionSystem(list);
    mfmStore.autoUpgradeMFMVersion(list);
  });
  listsChanged = true;

  // Save if changes were made
  if (collectionChanged) {
    save("collection");
  }
  if (listsChanged) {
    save("lists");
  }
}
