import { CONFIGS, BOARDING_ACTIONS } from "../data/configs";
import { fixes } from "../data/munitorum-field-manual/fixes";
import { normalizeString } from "./name-match";

export const parse = function (MFM) {
  let fixed = MFM.replace(/\r\n/g, "\n");

  fixes.forEach((fix) => {
    fixed = fixed.replaceAll(fix.in.replace(/\r\n/g, "\n"), fix.out);
  });

  const split = fixed.split(
    /Munitorum Field Manual © Copyright Games Workshop Limited \d\d\d\d\./
  );
  const lines = split[1].trim().split(/\r?\n/);

  const FACTIONS = [];
  const DATA_SHEETS = [{ name: "Enhancements", enhancements: true, sizes: [] }];
  const MFM_VERSION = split[0].trim().split(/\r?\n/)[2];

  let currentDatasheet;
  let currentFaction;
  let currentDetachment;
  let forgeWorld = false;
  let allies = false;
  let appendOption;
  let legends = false;

  lines.forEach((line) => {
    try {
      if (Number(line)) {
        // ignore page numbers
      } else if (line === "CODEX SUPPLEMENT:") {
        // ignore these labels
      } else if (line === "FORGE WORLD POINTS VALUES") {
        // forge world section
        forgeWorld = true;
      } else if (line === "LEGENDS FIELD MANUAL") {
        legends = true;
      } else if (
        [
          "YNNARI",
          "LEGIONS OF EXCESS",
          "PLAGUE LEGIONS",
          "BLOOD LEGIONS",
          "SCINTILLATING LEGIONS",
        ].includes(line)
      ) {
        // allies section
        allies = line;
      } else if (line === "DETACHMENT ENHANCEMENTS") {
        // detachments section
        currentDatasheet = DATA_SHEETS.find((d) => d.name === "Enhancements");
        forgeWorld = false;
      } else if (line.toUpperCase() === line) {
        // new faction
        currentDetachment = null;
        currentDatasheet = null;
        forgeWorld = false;
        allies = false;
        currentFaction = line
          .trim()
          .replace("INDEX: ", "")
          .replace("CODEX: ", "")
          .toUpperCase();
        if (!FACTIONS.find((f) => f.name === currentFaction)) {
          FACTIONS.push({
            name: currentFaction,
            detachments: [],
          });
        }
      } else if (line.includes("pts")) {
        // points line
        const match = line.match(
          /^(.*?)([ \.]*)(\([-+]\d*\))? ?(\+\s?)?(\d*) pts$/
        );

        const option = appendOption || {};
        appendOption = null;

        if (match) {
          const points = Number(match[5]);
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
        currentDetachment = line.trim().toUpperCase();
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
          forgeWorld,
          legends,
          sizes: [],
        };

        if (allies) {
          currentDatasheet.allies = allies;
        }

        if (
          CONFIGS["epic-hero"].includes(normalizeString(currentDatasheet.name))
        ) {
          currentDatasheet.epicHero = true;
        }

        if (
          CONFIGS["battle-line"].includes(normalizeString(currentDatasheet.name))
        ) {
          currentDatasheet.battleLine = true;
        }

        if (
          CONFIGS["fortification"].includes(normalizeString(currentDatasheet.name))
        ) {
          currentDatasheet.fortification = true;
        }

        if (
          CONFIGS["dedicated-transport"].includes(
            normalizeString(currentDatasheet.name)
          )
        ) {
          currentDatasheet.dedicatedTransport = true;
        }

        if (
          CONFIGS["character"].includes(normalizeString(currentDatasheet.name))
        ) {
          currentDatasheet.character = true;
        }

        if (CONFIGS["sub-factions"][currentFaction]) {
          currentDatasheet.subFaction = CONFIGS["sub-factions"][currentFaction];
        }

        DATA_SHEETS.push(currentDatasheet);
      }
    } catch (e) {
      console.log("error on line:", line, {
        currentDatasheet,
        appendOption,
        legends,
        forgeWorld,
        allies,
        currentFaction,
        currentDetachment,
      });
      throw e;
    }
  });

  // Inject boarding actions enhancements
  const enhancementsSheet = DATA_SHEETS.find(sheet => sheet.name === "Enhancements");
  if (enhancementsSheet) {
    const genericEnhancements = [
      "superior boarding tactics",
      "close-quarters killer",
      "peerless leader",
      "expert breacher",
      "personal teleporter",
      "trademark weapon"
    ];

    const breachingOperationEnhancements = [
      "breaching charges",
      "spoor seeker",
      "paralysing assault"
    ];

    Object.entries(BOARDING_ACTIONS).forEach(([factionName, detachments]) => {
      Object.entries(detachments).forEach(([detachmentName, config]) => {
        // Add generic enhancements
        genericEnhancements.forEach(enhancementName => {
          enhancementsSheet.sizes.push({
            name: enhancementName,
            detachment: detachmentName,
            enhancement: true,
            enhancementCategory: "boarding actions",
            points: 0
          });
        });

        // Add breaching operation enhancements
        breachingOperationEnhancements.forEach(enhancementName => {
          enhancementsSheet.sizes.push({
            name: enhancementName,
            detachment: detachmentName,
            enhancement: true,
            enhancementCategory: "breaching operations",
            points: 0
          });
        });

        // Add faction-specific boarding actions enhancements
        if (config.enhancements) {
          config.enhancements.forEach(enhancementName => {
            enhancementsSheet.sizes.push({
              name: enhancementName,
              detachment: detachmentName,
              enhancement: true,
              points: 0
            });
          });
        }
      });
    });
  }

  return {
    FACTIONS,
    DATA_SHEETS,
    MFM_VERSION,
  };
};
