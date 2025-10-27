import { CONFIGS } from "../data/configs";

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
