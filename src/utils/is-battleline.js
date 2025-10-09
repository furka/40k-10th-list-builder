import { CONFIGS } from "../data/configs";

export function isBattleLine(option, detachment) {
  return (
    option.battleLine ||
    CONFIGS.conditional[detachment]?.["battle-line"]?.includes(option.name)
  );
}
