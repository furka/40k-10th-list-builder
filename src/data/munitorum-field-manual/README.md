# Adding a New MFM Version

Step-by-step guide for integrating a new Munitorum Field Manual version.

## 1. Add the raw text file

Copy-paste the MFM PDF text into a new file: `MFMx.x.txt` (e.g. `MFM4.1.txt`).

The parser expects the text to start with the MFM header (lines 1-3: "MUNITORUM", "FIELD MANUAL", "VERSION x.x") followed by a copyright line that the parser splits on:
```
Munitorum Field Manual © Copyright Games Workshop Limited YYYY.
```

## 2. Diff against the previous version

Run a diff to identify changes:
```bash
diff src/data/munitorum-field-manual/MFM4.0.txt src/data/munitorum-field-manual/MFM4.1.txt
```

Look for:
- **New units** — lines added with a unit name followed by points lines (e.g. `5 models 135 pts`)
- **New detachments** — blocks of enhancement names with points, appearing in the `DETACHMENT ENHANCEMENTS` section
- **Point changes** — existing units with different point values

New detachments and their enhancements are parsed automatically from the MFM text. No config changes needed for detachments.

## 3. Classify new units

For each new unit, look up its keywords in the corresponding faction pack PDF to determine its role:
- `character` — has the Character keyword
- `epic-hero` — has the Epic Hero keyword (always also a character)
- `battle-line` — a Battleline unit
- `dedicated-transport` — has the Dedicated Transport keyword
- `fortification` — has the Fortification keyword

Units without any of these roles don't need config entries.

## 4. Update config

Add new units to the appropriate arrays in `src/data/configs/config.json` under their faction. Keep arrays alphabetically sorted.

## 5. Import in mfm.js

In `src/stores/mfm.js`:
1. Add the raw import: `import MFMxx from "../data/munitorum-field-manual/MFMx.x.txt?raw";`
2. Add the variable to the `imports` array

The version comparison logic automatically promotes the highest version to `MFM.CURRENT` and the second-highest to `MFM.PREVIOUS`.

## 6. Check formatting fixes

Review `fixes.js` for any text replacements that may need updating. Common issues from PDF copy-paste:
- Multi-line unit names (e.g. "Shield-Captain in\nAllarus Terminator Armour")
- Section header blocks (Imperial Agents, Legends Field Manual, etc.)
- Unit name casing issues (e.g. X-101 → x-101)

Existing fixes are applied via `replaceAll`, so they're harmless if the text doesn't match in a new version.

## 7. Verify

```bash
npm run dev    # App loads without errors, new units/detachments appear correctly
npm run build  # Production build succeeds
```

Check that:
- New units appear in their factions with correct role tags (character badge, etc.)
- New detachments appear with their enhancements
- Existing saved lists show point change notifications where applicable
