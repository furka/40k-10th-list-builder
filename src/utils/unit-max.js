import { isBattleLine } from "./is-battleline";
import { getBoardingActionsMax } from "./boarding-actions";

export function unitMax(option, isBoardingActions, compendium) {
  if (isBoardingActions) {
    return getBoardingActionsMax(
      option,
      compendium
    );
  }

  if (isBattleLine(option)) {
    return 6;
  } else if (option.epicHero) {
    return 1;
  } else {
    return 3;
  }
}
