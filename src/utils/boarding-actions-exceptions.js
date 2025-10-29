import { nameEquals } from "./name-match";

export const boardingActionsExceptions = {
  /**
   * If you include only one other CHARACTER unit, you can include up to 1 of the following units:
   * • Shield-Captain
   * • Valerian
   */
  requiresMaxOneOtherCharacter: {
    validate(slot, detachment, currentList, getDataSheet) {
      const slotUnitNames = slot.options.map((opt) => opt.name);

      const characterCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        const datasheet = getDataSheet(u.name);
        return datasheet?.character === true;
      }).length;

      return characterCount <= 1 ? slot.max : 0;
    },

    getMessage(slot) {
      const slotMax = slot.max || 1;
      const optionsText = slot.options.map((opt) => "• " + opt.name).join("\n");
      return `If you include only one other CHARACTER unit, you can include up to ${slotMax} of the following units:\n${optionsText}`;
    },
  },

  /**
   * The total number of all of these units cannot be more than the total number of ALLARUS CUSTODIANS, CUSTODIAN GUARD and CUSTODIAN WARDEN units:
   * • Prosecutors (5 or 10 models)
   * • Vigilators (5 or 10 models)
   * • Witchseekers (5 or 10 models)
   */
  requiresCustodianUnits: {
    validate(slot, detachment, currentList, getDataSheet) {
      const anathemaPsykanaNames = ["Prosecutors", "Vigilators", "Witchseekers"];
      const custodianNames = [
        "Allarus Custodians",
        "Custodian Guard",
        "Custodian Wardens",
      ];

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const anathemaPsykanaCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        return anathemaPsykanaNames.some((name) => nameEquals(u.name, name));
      }).length;

      const custodianCount = currentList.units.filter((u) =>
        custodianNames.some((name) => nameEquals(u.name, name))
      ).length;

      return Math.max(0, custodianCount - anathemaPsykanaCount);
    },

    getMessage(slot) {
      const optionsText = slot.options
        .map((opt) => {
          const sizesText = opt.models
            ? ` (${opt.models.join(" or ")} models)`
            : "";
          return "• " + opt.name + sizesText;
        })
        .join("\n");
      return `The total number of all of these units cannot be more than the total number of ALLARUS CUSTODIANS, CUSTODIAN GUARD and CUSTODIAN WARDEN units:\n${optionsText}`;
    },
  },

  /**
   * The combined total number of all of these units cannot be more than the total number of LEGIONARIES units:
   * • Accursed Cultists (5 models)
   * • Cultist Mob (10 models)
   * • Fellgor Beastmen (10 models)
   * • Traitor Guardsmen Squad (10 models)
   */
  requiresLegionariesUnits: {
    validate(slot, detachment, currentList, getDataSheet) {
      const cultistNames = [
        "Accursed Cultists",
        "Cultist Mob",
        "Fellgor Beastmen",
        "Traitor Guardsmen Squad",
      ];
      const legionariesNames = ["Legionaries"];

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const cultistCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        return cultistNames.some((name) => nameEquals(u.name, name));
      }).length;

      const legionariesCount = currentList.units.filter((u) =>
        legionariesNames.some((name) => nameEquals(u.name, name))
      ).length;

      return Math.max(0, legionariesCount - cultistCount);
    },

    getMessage(slot) {
      const optionsText = slot.options
        .map((opt) => {
          const sizesText = opt.models
            ? ` (${opt.models.join(" or ")} models)`
            : "";
          return "• " + opt.name + sizesText;
        })
        .join("\n");
      return `The combined total number of all of these units cannot be more than the total number of LEGIONARIES units:\n${optionsText}`;
    },
  },

  /**
   * The combined total number of [Jakhals] units cannot be more than the number of KHORNE BERZERKERS units:
   * • Jakhals (10 models)
   */
  requiresKhorneBerzerkersUnits: {
    validate(slot, detachment, currentList, getDataSheet) {
      const jakhalsNames = ["Jakhals"];
      const khorneBerzerkersNames = ["Khorne Berzerkers"];

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const jakhalsCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        return jakhalsNames.some((name) => nameEquals(u.name, name));
      }).length;

      const khorneBerzerkersCount = currentList.units.filter((u) =>
        khorneBerzerkersNames.some((name) => nameEquals(u.name, name))
      ).length;

      return Math.max(0, khorneBerzerkersCount - jakhalsCount);
    },

    getMessage(slot) {
      const optionsText = slot.options
        .map((opt) => {
          const sizesText = opt.models
            ? ` (${opt.models.join(" or ")} models)`
            : "";
          return "• " + opt.name + sizesText;
        })
        .join("\n");
      return `The combined total number of [Jakhals] units cannot be more than the number of KHORNE BERZERKERS units:\n${optionsText}`;
    },
  },

  /**
   * You can only include a PHOENIX LORD model if you also include one of the units it can normally be attached to:
   * • Asurmen (requires Dire Avengers)
   * • Baharroth (requires Swooping Hawks)
   * • Fuegan (requires Fire Dragons)
   * • Jain Zar (requires Howling Banshees)
   * • Karandras (requires Striking Scorpions)
   * • Maugan Ra (requires Dark Reapers)
   */
  requiresPhoenixLordAttachment: {
    validate(slot, detachment, currentList, getDataSheet) {
      const phoenixLordAttachments = {
        Asurmen: ["Dire Avengers"],
        Baharroth: ["Swooping Hawks"],
        Fuegan: ["Fire Dragons"],
        "Jain Zar": ["Howling Banshees"],
        Karandras: ["Striking Scorpions"],
        "Maugan Ra": ["Dark Reapers"],
      };

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const phoenixLordsInArmy = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (!isInThisSlot) return false;

        return Object.keys(phoenixLordAttachments).some((name) =>
          nameEquals(u.name, name)
        );
      });

      let maxAllowed = slot.max;
      for (const lord of phoenixLordsInArmy) {
        const lordName = Object.keys(phoenixLordAttachments).find((name) =>
          nameEquals(lord.name, name)
        );
        if (!lordName) continue;

        const requiredUnits = phoenixLordAttachments[lordName];
        const hasRequiredUnit = currentList.units.some((u) =>
          requiredUnits.some((reqUnit) => nameEquals(u.name, reqUnit))
        );

        if (!hasRequiredUnit) {
          maxAllowed = 0;
          break;
        }
      }

      return maxAllowed;
    },

    getMessage(slot) {
      const phoenixLords = [
        "Asurmen (requires Dire Avengers)",
        "Baharroth (requires Swooping Hawks)",
        "Fuegan (requires Fire Dragons)",
        "Jain Zar (requires Howling Banshees)",
        "Karandras (requires Striking Scorpions)",
        "Maugan Ra (requires Dark Reapers)",
      ];
      const optionsText = phoenixLords.map((lord) => "• " + lord).join("\n");
      return `You can only include a PHOENIX LORD model if you also include one of the units it can normally be attached to:\n${optionsText}`;
    },
  },

  /**
   * If you do not include any other CHARACTER models, you can include up to 1 of the following unit:
   * • Solitaire
   */
  requiresNoOtherCharacters: {
    validate(slot, detachment, currentList, getDataSheet) {
      const slotUnitNames = slot.options.map((opt) => opt.name);

      const characterCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        const datasheet = getDataSheet(u.name);
        return datasheet?.character === true;
      }).length;

      return characterCount === 0 ? slot.max : 0;
    },

    getMessage(slot) {
      const slotMax = slot.max || 1;
      const optionsText = slot.options.map((opt) => "• " + opt.name).join("\n");
      return `If you do not include any other CHARACTER models, you can include up to ${slotMax} of the following unit:\n${optionsText}`;
    },
  },

  /**
   * Chaos Daemons cannot mix units from opposed gods:
   * • Cannot mix Khorne + Slaanesh units
   * • Cannot mix Nurgle + Tzeentch units
   */
  godExclusionRules: {
    validate(slot, detachment, currentList, getDataSheet) {
      const khorneUnits = ["Bloodletters", "Flesh Hounds", "Bloodcrushers", "Skull Cannon", "Skullmaster", "Karanak", "Bloodmaster", "Skulltaker"];
      const slaaneshUnits = ["Daemonettes", "Fiends", "Seekers", "Seeker Chariots", "Exalted Seeker Chariot", "The Masque of Slaanesh", "Contorted Epitome", "Infernal Enrapturess", "Tranceweaver"];
      const nurgleUnits = ["Plaguebearers", "Beasts of Nurgle", "Nurglings", "Plague Drones", "Poxbringer", "Sloppity Bilepiper", "Spoilpox Scrivener", "Epidemius"];
      const tzeentchUnits = ["Pink Horrors", "Blue Horrors", "Brimstone Horrors", "Flamers", "Screamers", "Burning Chariot", "Changecaster", "Fluxmaster", "Fateskimmer", "Changeling", "The Changeling", "Blue Scribes", "Kairos Fateweaver", "Exalted Flamer"];

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const hasKhorne = currentList.units.some((u) =>
        khorneUnits.some((name) => nameEquals(u.name, name))
      );
      const hasSlaanesh = currentList.units.some((u) =>
        slaaneshUnits.some((name) => nameEquals(u.name, name))
      );
      const hasNurgle = currentList.units.some((u) =>
        nurgleUnits.some((name) => nameEquals(u.name, name))
      );
      const hasTzeentch = currentList.units.some((u) =>
        tzeentchUnits.some((name) => nameEquals(u.name, name))
      );

      const slotHasKhorne = slotUnitNames.some((name) =>
        khorneUnits.some((unit) => nameEquals(name, unit))
      );
      const slotHasSlaanesh = slotUnitNames.some((name) =>
        slaaneshUnits.some((unit) => nameEquals(name, unit))
      );
      const slotHasNurgle = slotUnitNames.some((name) =>
        nurgleUnits.some((unit) => nameEquals(name, unit))
      );
      const slotHasTzeentch = slotUnitNames.some((name) =>
        tzeentchUnits.some((unit) => nameEquals(name, unit))
      );

      if ((hasKhorne && slotHasSlaanesh) || (hasSlaanesh && slotHasKhorne)) return 0;
      if ((hasNurgle && slotHasTzeentch) || (hasTzeentch && slotHasNurgle)) return 0;

      return slot.max;
    },

    getMessage(slot) {
      return `Chaos Daemons cannot mix units from opposed gods:\n• Cannot mix Khorne + Slaanesh units\n• Cannot mix Nurgle + Tzeentch units`;
    },
  },

  /**
   * Drukhari SPACE LANE RAIDERS - Archon requires Kabalite Warriors:
   * You can include up to one of the following unit if you include one or more KABALITE WARRIORS units:
   * • Archon
   */
  requiresKabaliteWarriors: {
    validate(slot, detachment, currentList, getDataSheet) {
      const hasKabaliteWarriors = currentList.units.some((u) =>
        nameEquals(u.name, "Kabalite Warriors")
      );

      return hasKabaliteWarriors ? slot.max : 0;
    },

    getMessage(slot) {
      return `You can include up to one of the following unit if you include one or more KABALITE WARRIORS units:\n• Archon`;
    },
  },

  /**
   * Drukhari SPACE LANE RAIDERS - Haemonculus/Urien requires Wracks:
   * You can include up to one of the following units if you include one or more WRACKS units:
   * • Haemonculus (excluding Urien Rakarth)
   * • Urien Rakarth
   */
  requiresWracks: {
    validate(slot, detachment, currentList, getDataSheet) {
      const hasWracks = currentList.units.some((u) =>
        nameEquals(u.name, "Wracks")
      );

      return hasWracks ? slot.max : 0;
    },

    getMessage(slot) {
      return `You can include up to one of the following units if you include one or more WRACKS units:\n• Haemonculus (excluding Urien Rakarth)\n• Urien Rakarth`;
    },
  },

  /**
   * Drukhari SPACE LANE RAIDERS - Lelith/Succubus requires Wyches:
   * You can include up to one of the following units if you include one or more WYCHES units:
   * • Lelith Hesperax
   * • Succubus (excluding Lelith Hesperax)
   */
  requiresWyches: {
    validate(slot, detachment, currentList, getDataSheet) {
      const hasWyches = currentList.units.some((u) =>
        nameEquals(u.name, "Wyches")
      );

      return hasWyches ? slot.max : 0;
    },

    getMessage(slot) {
      return `You can include up to one of the following units if you include one or more WYCHES units:\n• Lelith Hesperax\n• Succubus (excluding Lelith Hesperax)`;
    },
  },

  /**
   * T'au Empire KROOT RAIDING PARTY - Auxiliary units require Kroot Carnivores:
   * For each KROOT CARNIVORES unit you include, you can include up to one of each of the following units:
   * • Kroot Farstalkers
   * • Kroot Hounds
   * • Krootox Riders
   */
  requiresKrootCarnivores: {
    validate(slot, detachment, currentList, getDataSheet) {
      const slotUnitNames = slot.options.map((opt) => opt.name);

      const unitsInSlot = currentList.units.filter((u) =>
        slotUnitNames.some((slotName) => nameEquals(slotName, u.name))
      );

      const krootCarnivoresCount = currentList.units.filter((u) =>
        nameEquals(u.name, "Kroot Carnivores")
      ).length;

      return Math.max(0, krootCarnivoresCount - unitsInSlot.length);
    },

    getMessage(slot) {
      return `For each KROOT CARNIVORES unit you include, you can include up to one of the following units:\n• Kroot Farstalkers\n• Kroot Hounds\n• Krootox Riders`;
    },
  },

  /**
   * Imperial Agents - Inquisitorial Agents require Inquisitor:
   * If you include an INQUISITOR model, you can include one of the following unit:
   * • Inquisitorial Agents (6 or 12 models)
   */
  requiresInquisitor: {
    validate(slot, detachment, currentList, getDataSheet) {
      const hasInquisitor = currentList.units.some((u) =>
        nameEquals(u.name, "Inquisitor")
      );

      return hasInquisitor ? slot.max : 0;
    },

    getMessage(slot) {
      return `If you include an INQUISITOR model, you can include one of the following unit:\n• Inquisitorial Agents (6 or 12 models)`;
    },
  },

  /**
   * Death Guard VECTORS OF DECAY - Cultists/Poxwalkers require Plague Marines:
   * The combined total number of Death Guard Cultists and Poxwalkers units cannot be more than the number of PLAGUE MARINES units
   */
  requiresPlagueMarinesUnits: {
    validate(slot, detachment, currentList, getDataSheet) {
      const cultistNames = ["Death Guard Cultists", "Poxwalkers"];
      const plagueMarinesNames = ["Plague Marines"];

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const cultistCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        return cultistNames.some((name) => nameEquals(u.name, name));
      }).length;

      const plagueMarinesCount = currentList.units.filter((u) =>
        plagueMarinesNames.some((name) => nameEquals(u.name, name))
      ).length;

      return Math.max(0, plagueMarinesCount - cultistCount);
    },

    getMessage(slot) {
      return `The combined total number of Death Guard Cultists and Poxwalkers units cannot be more than the number of PLAGUE MARINES units`;
    },
  },

  /**
   * Thousand Sons - Cultists/Tzaangors require Rubric Marines:
   * The combined total number of Thousand Sons Cultists and Tzaangors units cannot be more than the number of RUBRIC MARINES units
   */
  requiresRubricMarinesUnits: {
    validate(slot, detachment, currentList, getDataSheet) {
      const cultistNames = ["Thousand Sons Cultists", "Tzaangors"];
      const rubricMarinesNames = ["Rubric Marines"];

      const slotUnitNames = slot.options.map((opt) => opt.name);

      const cultistCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        return cultistNames.some((name) => nameEquals(u.name, name));
      }).length;

      const rubricMarinesCount = currentList.units.filter((u) =>
        rubricMarinesNames.some((name) => nameEquals(u.name, name))
      ).length;

      return Math.max(0, rubricMarinesCount - cultistCount);
    },

    getMessage(slot) {
      return `The combined total number of Thousand Sons Cultists and Tzaangors units cannot be more than the number of RUBRIC MARINES units`;
    },
  },
};
