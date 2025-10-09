import { isBattleLine } from "./is-battleline";

export function unitMax(option, detachment) {
  if (isBattleLine(option, detachment)) {
    return 6;
  } else if (option.epicHero) {
    return 1;
  } else {
    return 3;
  }
}
