import { isBattleLine } from "./is-battleline";
import {
  isBoardingActionsDetachment,
  getBoardingActionsMax
} from "./boarding-actions";

export function unitMax(option, appData) {
  const detachment = appData.currentList.detachment;

  if (isBoardingActionsDetachment(detachment)) {
    return getBoardingActionsMax(
      option,
      detachment,
      appData.currentList,
      appData.compendium
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
