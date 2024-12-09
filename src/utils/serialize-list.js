import { v4 as uuidv4 } from "uuid";

const MAP = {
  name: "n",
  faction: "f",
  maxPoints: "m",
  version: "v",
  mfm_version: "mfm",
  detachment: "d",
};

const UNIT_MAP = {
  models: "um",
  name: "un",
  points: "up",
  optionName: "uon",
};

const PARSERS = {
  maxPoints: Number,
  models: Number,
  points: Number,
};

export const serializeList = function (data) {
  const search = new URLSearchParams();

  Object.entries(data).forEach((pair) => {
    const key = pair[0];
    const val = pair[1];
    if (key in MAP) {
      search.set(MAP[key], encodeURIComponent(val));
    }
  });

  data.units.forEach((u) => {
    Object.entries(UNIT_MAP).forEach((pair) => {
      const key = pair[0];
      const sKey = pair[1];
      const val = u[key];
      search.append(sKey, encodeURIComponent(val || ""));
    });
  });

  return "?" + search.toString();
};

export const deserializeList = function (search) {
  const data = {
    units: [],
  };

  Object.entries(UNIT_MAP).forEach((pair) => {
    const key = pair[0];
    const sKey = pair[1];

    const res = search.getAll(sKey);

    for (let i = 0; i < res.length; i++) {
      if (!data.units[i]) {
        data.units[i] = {};
      }

      if (res[i]) {
        data.units[i][key] = parse(key, res[i]);
      }
    }
  });

  Object.entries(MAP).forEach((pair) => {
    const key = pair[0];
    const sKey = pair[1];

    const res = search.get(sKey);

    if (res) {
      data[key] = parse(key, res);
    }
  });

  return data;
};

function parse(key, val) {
  val = decodeURIComponent(val);
  if (PARSERS[key]) {
    return PARSERS[key](val);
  }
  return val;
}
