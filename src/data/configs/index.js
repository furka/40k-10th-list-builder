import configs from "./config.json";
import boardingActionsConfig from "./boarding-actions.json";

export const CONFIGS = {
  "battle-line": [],
  "dedicated-transport": [],
  "epic-hero": [],
  "sub-factions": {},
  character: [],
  conditional: {},
  fortification: [],
};

export const BOARDING_ACTIONS = boardingActionsConfig;

for (const key in configs) {
  const config = configs[key];

  CONFIGS["battle-line"].push(
    ...config["battle-line"].map((i) => i.toLowerCase())
  );
  CONFIGS["character"].push(...config["character"].map((i) => i.toLowerCase()));
  CONFIGS["epic-hero"].push(...config["epic-hero"].map((i) => i.toLowerCase()));
  CONFIGS["dedicated-transport"].push(
    ...config["dedicated-transport"].map((i) => i.toLowerCase())
  );

  if (config["fortification"]) {
    CONFIGS["fortification"].push(
      ...config["fortification"].map((i) => i.toLowerCase())
    );
  }

  if (config["sub-faction"]) {
    CONFIGS["sub-factions"][key] = config["sub-faction"];
  }
  if (config["conditional"]) {
    CONFIGS["conditional"] = {
      ...CONFIGS["conditional"],
      ...config["conditional"],
    };
  }
}
