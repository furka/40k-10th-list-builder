import { normalizeString } from "./name-match";
import { CONFIGS } from "../data/configs";

export function isEndlessEnhancement(option) {
  for (const enhancement of CONFIGS["endless-enhancements"]) {
    if (enhancement === normalizeString(option.name)) {
      return true;
    }
  }
  return false;
}
