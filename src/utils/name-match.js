import unitNameAliases from "../data/configs/unit-name-aliases.json";

export function normalizeString(str) {
  if (!str) return "";
  return str.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function nameEquals(name1, name2) {
  if (!name1 || !name2) {
    return false;
  }

  // Direct match
  if (normalizeString(name1) === normalizeString(name2)) {
    return true;
  }

  // Check if name1 is an alias of name2
  for (const [canonicalName, aliases] of Object.entries(unitNameAliases)) {
    if (normalizeString(canonicalName) === normalizeString(name2)) {
      if (
        aliases.some(
          (alias) => normalizeString(alias) === normalizeString(name1)
        )
      ) {
        return true;
      }
    }
  }

  // Check if name2 is an alias of name1
  for (const [canonicalName, aliases] of Object.entries(unitNameAliases)) {
    if (normalizeString(canonicalName) === normalizeString(name1)) {
      if (
        aliases.some(
          (alias) => normalizeString(alias) === normalizeString(name2)
        )
      ) {
        return true;
      }
    }
  }

  return false;
}
