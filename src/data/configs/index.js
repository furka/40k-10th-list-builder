import configs from "./config.json";

export const CONFIGS = {
  "battle-line": [],
  character: [],
  "epic-hero": [],
  "dedicated-transport": [],
  "sub-factions": {},
};

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

  if (config["sub-faction"]) {
    CONFIGS["sub-factions"][key] = config["sub-faction"];
  }
}
