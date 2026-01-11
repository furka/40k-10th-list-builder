import { CONFIGS } from "../data/configs";
import { useArmyListStore } from "../stores/armyList";

export function isDedicatedTransport(option) {
  const store = useArmyListStore();
  const detachment = store.detachment;

  return (
    option.dedicatedTransport ||
    CONFIGS.conditional[detachment]?.["dedicated-transport"]?.includes(option.name)
  );
}
