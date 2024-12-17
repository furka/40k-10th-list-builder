import MFM from "../data/munitorum-field-manual/MFM.txt?raw";
import { CONFIGS } from "../data/configs";
import GROTMAS from "../data/grotmas/detachments.json";

const split = MFM.split(
  /Munitorum Field Manual © Copyright Games Workshop Limited \d\d\d\d/
);
const lines = split[1].trim().split(/\r?\n/);

export const FACTIONS = [];
export const DATA_SHEETS = [
  { name: "Enhancements", enhancements: true, sizes: [] },
];
export const MFM_VERSION = split[0].trim().split(/\r?\n/)[2];

let currentDatasheet;
let currentFaction;
let currentDetachment;
let forgeWorld = false;
let appendOption;

lines.forEach((line) => {
  if (Number(line)) {
    // ignore page numbers
  } else if (line === "CODEX SUPPLEMENT:") {
    // ignore these labels
  } else if (line === "FORGE WORLD POINTS VALUES") {
    // forge world section
    forgeWorld = true;
  } else if (line === "DETACHMENT ENHANCEMENTS") {
    // detachments section
    currentDatasheet = DATA_SHEETS.find((d) => d.name === "Enhancements");
    forgeWorld = false;
  } else if (line.toUpperCase() === line) {
    // new faction
    currentFaction = line.trim().replace("INDEX: ", "").replace("CODEX: ", "");
    currentDetachment = null;
    currentDatasheet = null;
    forgeWorld = false;
    FACTIONS.push({
      name: currentFaction,
      detachments: [],
    });
  } else if (line.includes("pts")) {
    // points line
    const match = line.match(
      /^([^\.]*)([ \.]*)(\([-+]\d*\))? ?(\+\s?)?(\d*) pts$/
    );

    const option = appendOption || {};
    appendOption = null;

    if (match) {
      const points = Number(match[5]);
      const change = match[3];
      const bonus = match[4];
      const models = match[1].trim().match(/(\d*) models?/);

      option.points = points;

      if (bonus) {
        // bonus options can be taken an unlimited number of times
        option.bonus = true;
      }

      if (models) {
        option.models = Number(models[1]);
      } else if (option.name) {
        option.name += ` ${match[1]}`.trim();
      } else {
        option.name = match[1].trim();
      }

      if (change) {
        option.change = change.split(/[\(\)]/)[1];
      }

      if (currentDetachment) {
        option.detachment = currentDetachment;
        option.enhancement = true;
      }

      currentDatasheet.sizes.push(option);
    } else {
      console.log("unknown line syntax", line);
    }
  } else if (currentDatasheet && currentDatasheet.name === "Enhancements") {
    // detachment name
    currentDetachment = line.trim();
    FACTIONS.find((f) => f.name === currentFaction)?.detachments.push({
      name: currentDetachment,
    });
  } else if (currentDatasheet && currentDatasheet.sizes.length < 1) {
    // account for multi-line datasheet names
    currentDatasheet.name += ` ${line}`;
  } else if (line.match(/^\d/)) {
    appendOption = { name: line };
  } else {
    // start new datasheet
    currentDatasheet = {
      name: line.trim(),
      faction: currentFaction,
      max: 3,
      forgeWorld,
      sizes: [],
    };

    if (CONFIGS["epic-hero"].includes(currentDatasheet.name.toLowerCase())) {
      currentDatasheet.epicHero = true;
      currentDatasheet.max = 1;
    }

    if (CONFIGS["battle-line"].includes(currentDatasheet.name.toLowerCase())) {
      currentDatasheet.battleLine = true;
      currentDatasheet.max = 6;
    }

    if (
      CONFIGS["dedicated-transport"].includes(
        currentDatasheet.name.toLowerCase()
      )
    ) {
      currentDatasheet.dedicatedTransport = true;
      currentDatasheet.max = 6;
    }

    if (CONFIGS["character"].includes(currentDatasheet.name.toLowerCase())) {
      currentDatasheet.character = true;
    }

    if (CONFIGS["sub-factions"][currentFaction]) {
      currentDatasheet.subFaction = CONFIGS["sub-factions"][currentFaction];
    }

    DATA_SHEETS.push(currentDatasheet);
  }
});

GROTMAS.forEach((detachment) => {
  const { name, faction } = detachment;
  const enhancements = DATA_SHEETS.find((e) => e.enhancements);

  FACTIONS.find((f) => f.name === faction)?.detachments.push({ name });

  detachment.enhancements.forEach((item) => {
    item.name = item.name.toLowerCase();
    item.detachment = name;
    item.enhancement = true;
    enhancements.sizes.push(item);
  });
});
