import { nameEquals } from "./name-match";

export const boardingActionsExceptions = {
  /**
   * If you include only one other CHARACTER unit, you can include up to 1 of the following units:
   * • Shield-Captain
   * • Valerian
   */
  requiresMaxOneOtherCharacter: {
    validate(slot, detachment, currentList, compendium) {
      const slotUnitNames = slot.options.map((opt) => opt.name);

      const characterCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        const datasheet = compendium.find((ds) => nameEquals(ds.name, u.name));
        return datasheet?.character === true;
      }).length;
      return characterCount <= 1;
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
    validate(slot, detachment, currentList, compendium) {
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

      return anathemaPsykanaCount < custodianCount;
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
    validate(slot, detachment, currentList, compendium) {
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

      return cultistCount < legionariesCount;
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
    validate(slot, detachment, currentList, compendium) {
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

      return jakhalsCount < khorneBerzerkersCount;
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
    validate(slot, detachment, currentList, compendium) {
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

      for (const lord of phoenixLordsInArmy) {
        const lordName = Object.keys(phoenixLordAttachments).find((name) =>
          nameEquals(lord.name, name)
        );
        if (!lordName) continue;

        const requiredUnits = phoenixLordAttachments[lordName];
        const hasRequiredUnit = currentList.units.some((u) =>
          requiredUnits.some((reqUnit) => nameEquals(u.name, reqUnit))
        );

        if (!hasRequiredUnit) return false;
      }

      return true;
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
    validate(slot, detachment, currentList, compendium) {
      const slotUnitNames = slot.options.map((opt) => opt.name);

      const characterCount = currentList.units.filter((u) => {
        const isInThisSlot = slotUnitNames.some((slotName) =>
          nameEquals(slotName, u.name)
        );
        if (isInThisSlot) return false;

        const datasheet = compendium.find((ds) => nameEquals(ds.name, u.name));
        return datasheet?.character === true;
      }).length;

      return characterCount === 0;
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
    validate(slot, detachment, currentList, compendium) {
      // Define god-specific units (characters and troops)
      const khorneUnits = ["Bloodletters", "Flesh Hounds", "Bloodcrushers", "Skull Cannon", "Skullmaster", "Karanak", "Bloodmaster", "Skulltaker"];
      const slaaneshUnits = ["Daemonettes", "Fiends", "Seekers", "Seeker Chariots", "Exalted Seeker Chariot", "The Masque of Slaanesh", "Contorted Epitome", "Infernal Enrapturess", "Tranceweaver"];
      const nurgleUnits = ["Plaguebearers", "Beasts of Nurgle", "Nurglings", "Plague Drones", "Poxbringer", "Sloppity Bilepiper", "Spoilpox Scrivener", "Epidemius"];
      const tzeentchUnits = ["Pink Horrors", "Blue Horrors", "Brimstone Horrors", "Flamers", "Screamers", "Burning Chariot", "Changecaster", "Fluxmaster", "Fateskimmer", "Changeling", "The Changeling", "Blue Scribes", "Kairos Fateweaver", "Exalted Flamer"];

      // Check which gods are present in the army
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

      // Check for opposed god conflicts
      if (hasKhorne && hasSlaanesh) return false;
      if (hasNurgle && hasTzeentch) return false;

      return true;
    },

    getMessage(slot) {
      return `Chaos Daemons cannot mix units from opposed gods:\n• Cannot mix Khorne + Slaanesh units\n• Cannot mix Nurgle + Tzeentch units`;
    },
  },
};
