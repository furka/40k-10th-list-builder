import configs from "./config.json";

export const CONFIGS = {
  "battle-line": [],
  "epic-hero": [],
  "dedicated-transport": [],
};

for (const key in configs) {
  const config = configs[key];

  CONFIGS["battle-line"].push(...config["battle-line"]);
  CONFIGS["epic-hero"].push(...config["epic-hero"]);
  CONFIGS["dedicated-transport"].push(...config["dedicated-transport"]);
}
