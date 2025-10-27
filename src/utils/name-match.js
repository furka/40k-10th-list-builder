function normalizeString(str) {
  if (!str) return "";
  return str
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function nameEquals(name1, name2) {
  if (!name1 || !name2) return false;
  return normalizeString(name1) === normalizeString(name2);
}
