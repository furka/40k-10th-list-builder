import { isBattleLine } from "./is-battleline";
import { getBoardingActionsMax } from "./boarding-actions";

export function unitMax(option, isBoardingActions) {
  if (isBoardingActions) {
    return getBoardingActionsMax(option);
  }

  if (isBattleLine(option)) {
    return 6;
  } else if (option.epicHero) {
    return 1;
  } else {
    return 3;
  }
}
