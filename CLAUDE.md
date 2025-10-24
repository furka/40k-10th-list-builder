# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Warhammer 40K 10th Edition army list builder hosted at https://furka.github.io/40k-10th-list-builder/. It's a Vue 3 application built with Vite that helps users build and manage army lists based on the official Munitorum Field Manual (MFM) points values.

## Development Commands

```bash
# Install dependencies (use ci for clean install from lock file)
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Data Flow and State Management

The application uses a reactive `appData` object (in `src/App.vue`) as the central state store. This object contains:
- `currentList`: The active army list being edited
- `lists`: Saved army lists stored in localStorage
- `compendium`: All unit datasheets from the current MFM version
- `factions`: Available factions and their detachments
- `collection`: Array of units the user owns (with `name` and `owned` count)
- UI state (filters, sort order, etc.)

State persistence is handled through Vue watchers that automatically save to localStorage when tracked properties change (see `track()` function in `src/App.vue`).

#### AppData Structure Example

```javascript
{
  // UI State
  appHeight: 1305,
  appWidth: 1529,
  codexFilter: "",               // Text filter for unit search
  group: "None",                 // or "Role" for grouped display in ArmyCodex
  sortOrder: "A-Z",              // Sort order: "A-Z", "Expensive first", "Cheap first"
  showForgeWorld: true,          // Toggle visibility of Forge World units
  showLegends: false,            // Toggle visibility of Legends units
  showPointsChanges: true,       // Show point changes when upgrading MFM versions
  editCollection: false,         // Whether collection editor is open
  armyName: "",                  // Legacy field (replaced by currentList.name)

  // Current Army List
  currentList: {
    name: "My Army",
    faction: "THOUSAND SONS",              // Faction name (uppercase)
    detachment: "HEXWARP THRALLBAND",      // Selected detachment
    mfm_version: "VERSION 1.8",            // MFM version (underscore, not camel case)
    version: "1.3.5",                      // App version when list was created
    maxPoints: 2000,                       // Point limit for the army
    units: [
      {
        // Regular unit example
        id: "uuid-123",                    // Unique ID for drag-and-drop (added at runtime)
        name: "Necron Warriors",
        optionName: "10 models",           // May be omitted if unit has only one size
        models: 10,
        points: 100,
        faction: "NECRONS",
        battleLine: true,                  // Role flags (only present if true)
        character: false,
        epicHero: false,
        dedicatedTransport: false,
        fortification: false,
        forgeWorld: false,
        legends: false
      },
      {
        // Enhancement example (special unit type)
        name: "Enhancements",
        optionName: "Dimensional Overseer",
        points: 25,
        // No models field for enhancements
        // No faction field for enhancements
      },
      {
        // Minimal unit example (some fields may be omitted)
        id: "uuid-789",
        name: "Ghost Ark",
        models: 1,
        points: 125
        // optionName omitted when unit has single size option
      }
    ]
  },

  // Saved Lists
  lists: [
    { name: "Sisters 2k", faction: "ADEPTA SORORITAS", /* ... */ },
    { name: "Necrons 1k", faction: "NECRONS", /* ... */ }
  ],

  // Deleted lists (for undo)
  bin: [],

  // User's Collection
  collection: [
    { name: "Battle Sisters Squad", owned: 2 },
    { name: "Canoness", owned: 1 }
  ],

  // MFM Data (parsed from text files)
  compendium: [
    {
      name: "Battle Sisters Squad",
      faction: "ADEPTA SORORITAS",
      battleLine: true,
      character: false,
      epicHero: false,
      dedicatedTransport: false,
      fortification: false,
      forgeWorld: false,
      legends: false,
      sizes: [
        { name: "10 models", models: 10, points: 110, bonus: false },
        { name: "20 models", models: 20, points: 220, bonus: false }
      ]
    }
  ],

  // Available Factions
  factions: [
    {
      name: "ADEPTA SORORITAS",
      detachments: [
        { name: "HALLOWED MARTYRS" },
        { name: "BRINGERS OF FLAME" }
      ]
    }
  ]
}
```

### MFM (Munitorum Field Manual) System

The core data structure is built around parsing official Warhammer 40K points documents:

- **Source Files**: `src/data/munitorum-field-manual/MFM*.txt` - Direct copy-paste from official PDF documents
- **Parser**: `src/utils/data-reader.js` - Parses raw text into structured data (FACTIONS, DATA_SHEETS, MFM_VERSION)
- **Version Manager**: `src/utils/mfm.js` - Imports all MFM versions, provides `MFM.CURRENT`, `MFM.LATEST`, `MFM.PREVIOUS`
- **Upgrades**: `src/utils/update-list-mfm.js` - Handles upgrading saved lists to new MFM versions, detecting point changes

When adding a new MFM version:
1. Add the raw text file to `src/data/munitorum-field-manual/`
2. Import it in `src/utils/mfm.js` and add to imports array
3. Add any necessary text fixes to `src/data/munitorum-field-manual/fixes.js`

### Component Structure

- **App.vue**: Root component, manages global state and localStorage persistence
- **ArmyList.vue**: Left panel showing selected units, uses vuedraggable for reordering, visually scales based on points
- **ArmyCodex.vue**: Right panel showing available units filtered by faction/detachment with grouping and sorting
- **DataSheet.vue**: Individual unit card showing available sizes/options
- **PrintableArmyList.vue**: Print-only view (hidden on screen, shown via CSS @media print)

### List Sharing System

Lists can be shared via URL using a compressed query string format:
- **Serialization**: `src/utils/serialize-list.js` converts list objects to URL params (shortened keys: `n`, `f`, `m`, `v`, `mfm`, `d`, `un`, `up`, etc.)
- On app load, if URL params exist, the list is deserialized and added to saved lists
- Used by ShareListModal component to generate shareable links

### Configuration System

`src/data/configs/index.js` and `config.json` define unit metadata by faction:
- `battle-line`: Units that count as Battle Line
- `epic-hero`: Epic Hero units (limited to 3 per army)
- `character`: Character units
- `dedicated-transport`: Transport units
- `fortification`: Fortification units
- `sub-factions`: Sub-faction mappings
- `conditional`: Special rules for unit availability

This metadata is merged into datasheets during parsing.

## Key Technical Details

- **Vue 3 Composition API**: All components use `<script setup>` syntax
- **Deep Freeze**: MFM data is frozen after parsing to prevent accidental mutations
- **UUID**: Each unit instance gets a unique ID for drag-and-drop tracking
- **Visual Scaling**: ArmyList component dynamically scales unit display based on points/max points ratio
- **Vite Config**: Base path set to `/40k-10th-list-builder/` for GitHub Pages deployment

## Code Style Guidelines

### Comments

**Write self-documenting code. Comments should explain WHY, not WHAT.**

Bad (redundant comments):
```javascript
if (unit.name === "Enhancements") return 0; // Enhancements first
if (dataSheet.character) return 1; // Characters
if (dataSheet.battleLine) return 2; // Battle Line
```

Good (self-documenting code):
```javascript
if (unit.name === "Enhancements") return 0;
if (dataSheet.character) return 1;
if (dataSheet.battleLine) return 2;
```

Good (explaining WHY):
```javascript
// Units don't have role properties copied from datasheets, so we look them up
const dataSheet = getDataSheet(unit.name);
if (!dataSheet) return 4;
```

Only add comments when:
- Explaining non-obvious business logic or workarounds
- Clarifying why a particular approach was chosen
- Warning about gotchas or edge cases

Never add comments that simply repeat what the code says.

## Common Tasks

When working with unit data or display logic, remember that units have:
- `name`: Datasheet name (e.g., "Intercessor Squad")
- `optionName`: Size/variant name (e.g., "5 models")
- `models`: Number of models in the unit
- `points`: Current point cost
- `bonus`: Boolean indicating if option can be taken multiple times

When making changes to unit filtering or grouping, the relevant logic is in `src/components/ArmyCodex.vue` which handles faction filtering, Forge World, Legends, and role-based grouping.
