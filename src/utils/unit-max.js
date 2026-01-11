import { isBattleLine } from "./is-battleline";
import { getBoardingActionsMax } from "./boarding-actions";
import { isDedicatedTransport } from "./is-dedicated-transport";

export function unitMax(option, isBoardingActions) {
  if (isBoardingActions) {
    return getBoardingActionsMax(option);
  }

  if (isBattleLine(option) || isDedicatedTransport(option)) {
    return 6;
  } else if (option.epicHero) {
    return 1;
  } else {
    return 3;
  }
}
