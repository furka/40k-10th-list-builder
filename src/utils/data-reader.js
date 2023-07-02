import MFM from "../data/munitorum-field-manual/MFM.txt?raw";

import { DATA } from "../data/datasheets/index";

function getKeywords(name) {
  const regex = new RegExp(`${name}\\r\\nKEYWORDS:(.*)`, "mi");
  const match = DATA.match(regex);

  if (match) {
    return match[1].toLowerCase();
  }

  return "";
}

const lines = MFM.trim().split(/\r?\n/);
export const FACTIONS = [];
let currentCodex;
let currentDatasheet;
let currentDetachment;
let appendOption;

lines.forEach((line) => {
  if (Number(line)) {
    // ignore page numbers
  } else if (line === "DETACHMENT ENHANCEMENTS") {
    // detachments section
    currentDetachment = {};
    currentDatasheet = {
      name: "Enhancements",
      enhancements: true,
      sizes: [],
    };
    currentDetachment.enhancements = currentDatasheet;
    currentCodex.detachments.push(currentDetachment);
  } else if (line.toUpperCase() === line) {
    // new faction
    currentCodex = {
      name: line,
      detachments: [],
      "data-sheets": [],
    };
    currentDetachment = null;
    currentDatasheet = null;
    FACTIONS.push(currentCodex);
  } else if (line.includes("pts")) {
    // points line
    const match = line.match(/^([^\.]*)([ \.]*)(\+\s?)?(\d*) pts$/);

    const option = appendOption || {};
    appendOption = null;

    if (match) {
      const points = Number(match[4]);
      const bonus = match[3];
      const models = match[1].trim().match(/(\d*) models?/);

      option.points = points;

      if (bonus) {
        option.bonus = true;
      }

      if (models) {
        option.models = Number(models[1]);
      } else if (option.name) {
        option.name += ` ${match[1]}`;
      } else {
        option.name = match[1];
      }

      currentDatasheet.sizes.push(option);
    } else {
      console.log("unknown line syntax", line);
    }
  } else if (currentDetachment) {
    // detachment name
    currentDetachment.name = line;
  } else if (currentDatasheet && currentDatasheet.sizes.length < 1) {
    // account for multi-line datasheet names
    currentDatasheet.name += ` ${line}`;
  } else if (line.match(/^\d/)) {
    appendOption = { name: line };
  } else {
    // start new datasheet
    currentDatasheet = {
      name: line,
      max: 3,
      sizes: [],
    };

    const keywords = getKeywords(currentDatasheet.name);

    if (keywords.includes("epic hero")) {
      currentDatasheet.epicHero = true;
      currentDatasheet.max = 1;
    }

    if (keywords.includes("battleline")) {
      currentDatasheet.battleLine = true;
      currentDatasheet.max = 6;
    }

    currentCodex["data-sheets"].push(currentDatasheet);
  }
});
