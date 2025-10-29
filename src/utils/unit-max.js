import { isBattleLine } from "./is-battleline";
import { getBoardingActionsMax } from "./boarding-actions";

export function unitMax(option, detachment, isBoardingActions, currentList, compendium) {
  if (isBoardingActions) {
    return getBoardingActionsMax(
      option,
      detachment,
      currentList,
      compendium
    );
  }

  if (isBattleLine(option, detachment)) {
    return 6;
  } else if (option.epicHero) {
    return 1;
  } else {
    return 3;
  }
}
