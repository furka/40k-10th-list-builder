import { CONFIGS } from "../data/configs";
import { useArmyListStore } from "../stores/armyList";

export function isBattleLine(option) {
  const store = useArmyListStore();
  const detachment = store.detachment;

  return (
    option.battleLine ||
    CONFIGS.conditional[detachment]?.["battle-line"]?.includes(option.name)
  );
}
