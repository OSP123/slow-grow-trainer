// The canonical war zones of Vespera Prime.
//
// These names were previously retyped in four places — Dashboard's THEATRES,
// AdminDashboard's REAL_SECTORS, Matchmaker's REAL_THEATRE_SECTORS, and the
// global event dropdown — and they drifted apart. That drift has already killed
// two features silently:
//
//   - territories.name was seeded 'Orbital Defense Grid' while matches are
//     fought in 'Orbital Relay Station', so the campaign map never matched.
//   - the global event dropdown offered 'Hive Primus', 'Magma Forges',
//     'Orbital Tether', 'The Sump' and 'Rad-Zone Gamma'. Only one of those six
//     is a real theatre, so a per-theatre event could never attach to a match.
//
// Everything that names a war zone should import from here.

/** The canonical war zone names, as a literal union so every consumer must cover exactly these. */
export const THEATRE_NAMES = [
  'The Hive Spires',
  'The Ash Wastes',
  'The Magma Forges',
  'Orbital Relay Station',
  'The Sump Ruins',
  'The Toxic Oceans',
] as const;

export type TheatreName = (typeof THEATRE_NAMES)[number];

export const THEATRE_SECTORS: Record<TheatreName, string[]> = {
  'The Hive Spires': ['Outer Wall', 'Hab Districts', 'Merchant Quarter', 'Administratum', 'Spire Apex'],
  'The Ash Wastes': ['Rad Perimeter', 'Nomad Trail', 'Storm Corridor', 'Scavenger Dens', 'Dead Zone'],
  'The Magma Forges': ['Cooling Vents', 'Extraction Bay', 'Foundry Floor', 'Slag Channels', 'Forge Core'],
  'Orbital Relay Station': ['Docking Pylons', 'Comms Array', 'Weapons Battery', 'Engineering Deck', 'Command Bridge'],
  'The Sump Ruins': ['Crater Rim', 'Outer Ruins', 'Collapsed Tunnels', 'Warp Fissure', 'Buried Tomb'],
  'The Toxic Oceans': ['Shore Batteries', 'Tidal Zone', 'Deep Channels', 'Leviathan Depths', 'Abyssal Trench'],
};

export const DEFAULT_THEATRE: TheatreName = 'The Ash Wastes';

/** Narrow an arbitrary string to a canonical war zone, or undefined. */
export function asTheatreName(value?: string | null): TheatreName | undefined {
  return (THEATRE_NAMES as readonly string[]).includes(value || '')
    ? (value as TheatreName)
    : undefined;
}

/**
 * 'The Ash Wastes - Nomad Trail' -> 'The Ash Wastes'.
 * Matchups store the full 'Theatre - Sector' string; territories, events and the
 * campaign map all key on the bare theatre. Mirrors split_part(name, ' - ', 1) in SQL.
 */
export function baseTheatre(theatreName?: string | null): string {
  return (theatreName || '').split(' - ')[0].trim();
}

/** The sub-sector a given campaign month is fought over within a theatre. */
export function sectorForMonth(theatre: string, currentMonth: number): string {
  const sectors = THEATRE_SECTORS[asTheatreName(theatre) ?? DEFAULT_THEATRE];
  const idx = Math.min(Math.max(1, currentMonth), sectors.length) - 1;
  return sectors[idx];
}

/** Full 'Theatre - Sector' name for a match in the given month. */
export function buildTheatreName(theatre: string, currentMonth: number): string {
  const chosen = asTheatreName(theatre) ?? DEFAULT_THEATRE;
  return `${chosen} - ${sectorForMonth(chosen, currentMonth)}`;
}
