// This file contains manual fixes to account for wonky formatting in the MFM
export const fixes = [
  {
    in: `Shield-Captain in
Allarus Terminator Armour`,
    out: "Shield-Captain in Allarus Terminator Armour",
  },
  {
    in: `1 Sword Brother, 4 Initiates
and 5 Neophytes`,
    out: "1 Sword Brother, 4 Initiates and 5 Neophytes",
  },
  {
    in: `1 Sword Brother, 9 Initiates
and 10 Neophytes`,
    out: "1 Sword Brother, 9 Initiates and 10 Neophytes",
  },
  {
    in: `1 Sword Brother, 5 Initiates
and 4 Neophytes`,
    out: "1 Sword Brother, 5 Initiates and 4 Neophytes",
  },
  {
    in: `1 Sword Brother, 11 Initiates
and 8 Neophytes`,
    out: "1 Sword Brother, 11 Initiates and 8 Neophytes",
  },
  {
    in: `CODEX: IMPERIAL AGENTS
If your Army Faction is not Agents of the Imperium, but every model in your army has the Imperium keyword, you can
include Agents of the Imperium units in your army even if they do not have the Faction keyword you selected in the Select
Army Faction step. When doing so, use the points values shown on the following page.
ARMY FACTION:
AGENTS OF THE IMPERIUM`,
    out: "CODEX: AGENTS OF THE IMPERIUM",
  },
  {
    in: `EVERY MODEL HAS
IMPERIUM KEYWORD`,
    out: "AGENTS OF THE IMPERIUM (ALLIES)",
  },
  {
    in: `CODEX: SPACE WOLVES
The points below allow players to enjoy Codex: Space Wolves in non-tournament settings. Until the full release of this
Codex, players should continue using the Index: Space Wolves points and rules for tournaments and other similar events.`,
    out: "CODEX: SPACE WOLVES (CODEX)",
  },
];
