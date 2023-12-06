import configs from "./config.json";

export const CONFIGS = {
  "battle-line": [],
  "epic-hero": [],
};

for (const key in configs) {
  const config = configs[key];

  CONFIGS["battle-line"].push(...config["battle-line"]);
  CONFIGS["epic-hero"].push(...config["epic-hero"]);
}
