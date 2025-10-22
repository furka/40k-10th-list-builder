import { parse } from "./data-reader";
import deepFreeze from "deep-freeze";

import MFM29 from "../data/munitorum-field-manual/MFM2.9.txt?raw";
import MFM32 from "../data/munitorum-field-manual/MFM3.2.txt?raw";
import MFM33 from "../data/munitorum-field-manual/MFM3.3.txt?raw";
import MFM34 from "../data/munitorum-field-manual/MFM3.4.txt?raw";
import MFM35 from "../data/munitorum-field-manual/MFM3.5.txt?raw";

const MFM = {};

const imports = [MFM29, MFM32, MFM33, MFM34, MFM35];

imports.forEach((mod) => {
  const { FACTIONS, DATA_SHEETS, MFM_VERSION } = parse(mod);
  MFM[MFM_VERSION] = { FACTIONS, DATA_SHEETS, MFM_VERSION };

  if (!MFM.CURRENT) {
    MFM.CURRENT = MFM[MFM_VERSION];
  } else if (MFM_VERSION > MFM.CURRENT.MFM_VERSION) {
    MFM.CURRENT = MFM[MFM_VERSION];
  }

  if (!MFM.PREVIOUS) {
    MFM.PREVIOUS = MFM[MFM_VERSION];
  } else if (
    MFM_VERSION > MFM.PREVIOUS.MFM_VERSION &&
    MFM_VERSION < MFM.CURRENT.MFM_VERSION
  ) {
    MFM.PREVIOUS = MFM[MFM_VERSION];
  }
});

deepFreeze(MFM);

export { MFM };
