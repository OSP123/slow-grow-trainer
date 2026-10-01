// Deeds a commander can be credited with from their battle report.
//
// The campaign map is driven by what commanders describe doing, not by who won.
// An admin reads each submitted report and awards the deeds it describes; each
// deed expands into one or more rows in `campaign_awards`, and the territory map
// is derived by replaying that ledger.
//
// Edit this file to retune the campaign. Nothing here is stored in the database
// except the resulting award rows, so changing a delta affects future awards
// only — existing awards keep the value they were granted at.

/** Columns the ledger is allowed to move. Must match the CHECK constraint on campaign_awards.metric. */
export type AwardMetric =
  | 'imperium_control'
  | 'chaos_corruption'
  | 'ork_foothold'
  | 'tau_foothold'
  | 'aeldari_foothold'
  | 'necron_foothold'
  | 'tyranid_foothold'
  | 'genestealer_foothold'
  | 'votann_resources';

/**
 * Where an effect lands.
 *  - 'battle'   the war zone the match was fought in
 *  - 'campaign' no territory; a campaign-wide tally such as Votann resources
 *  - any other string pins it to that territory by name
 */
export type DeedTarget = 'battle' | 'campaign' | string;

export interface DeedEffect {
  metric: AwardMetric;
  delta: number;
  target: DeedTarget;
}

export interface Deed {
  id: string;
  label: string;
  description: string;
  /** Army factions this deed is offered for. Empty means any faction. */
  factions: string[];
  effects: DeedEffect[];
}

const NECRONS = ['Necrons'];
const VOTANN = ['Leagues of Votann'];
const TAU = ["T'au Empire"];
const ORKS = ['Orks'];
const AELDARI = ['Aeldari', 'Drukhari'];
const TYRANIDS = ['Tyranids'];
const GENESTEALER = ['Genestealer Cults'];

const IMPERIUM = [
  'Space Marines', 'Blood Angels', 'Dark Angels', 'Space Wolves', 'Black Templars',
  'Deathwatch', 'Grey Knights', 'Ultramarines', 'Imperial Fists', 'Iron Hands',
  'Raven Guard', 'Salamanders', 'White Scars', 'Astra Militarum', 'Adepta Sororitas',
  'Adeptus Custodes', 'Adeptus Mechanicus', 'Imperial Knights', 'Imperial Agents',
  'Adeptus Titanicus', 'Unaligned Forces',
];

const CHAOS = [
  'Chaos Space Marines', 'World Eaters', 'Death Guard', 'Thousand Sons',
  "Emperor's Children", 'Chaos Daemons', 'Chaos Knights',
];

export const CAMPAIGN_DEEDS: Deed[] = [
  // ── Necrons ──────────────────────────────────────────────────────────────
  // A tomb-world stirring is felt under The Sump Ruins wherever it happens.
  {
    id: 'necron-awaken-tomb',
    label: 'Awakened a tomb complex',
    description: 'Dynastic legions roused from stasis. Stirs the tomb world beneath The Sump Ruins as well as the contested zone.',
    factions: NECRONS,
    effects: [
      { metric: 'necron_foothold', delta: 5, target: 'battle' },
      { metric: 'necron_foothold', delta: 5, target: 'The Sump Ruins' },
    ],
  },
  {
    id: 'necron-reclaim-relic',
    label: 'Reclaimed a tomb-world relic',
    description: 'Ancient technology recovered and returned to the dynasty.',
    factions: NECRONS,
    effects: [{ metric: 'necron_foothold', delta: 3, target: 'The Sump Ruins' }],
  },
  {
    id: 'necron-repel-crypts',
    label: 'Repelled intruders from the crypts',
    description: 'Grave-robbers and excavators driven off the tomb approaches.',
    factions: NECRONS,
    effects: [{ metric: 'necron_foothold', delta: 2, target: 'battle' }],
  },

  // ── Leagues of Votann ────────────────────────────────────────────────────
  // Resources are a campaign-wide tally for the Ancestor Cores, not territory.
  {
    id: 'votann-secure-cache',
    label: 'Secured a promethium cache',
    description: 'Raw materials extracted and shipped to the Ancestor Cores.',
    factions: VOTANN,
    effects: [{ metric: 'votann_resources', delta: 10, target: 'campaign' }],
  },
  {
    id: 'votann-strip-infrastructure',
    label: 'Stripped industrial infrastructure',
    description: 'Heavy machinery dismantled wholesale. The richest haul available.',
    factions: VOTANN,
    effects: [{ metric: 'votann_resources', delta: 15, target: 'campaign' }],
  },
  {
    id: 'votann-escort-convoy',
    label: 'Escorted a mining convoy',
    description: 'A extraction convoy brought through hostile ground intact.',
    factions: VOTANN,
    effects: [{ metric: 'votann_resources', delta: 5, target: 'campaign' }],
  },

  // ── T'au Empire ──────────────────────────────────────────────────────────
  {
    id: 'tau-disrupt-ritual',
    label: 'Disrupted a warp ritual',
    description: 'Daemonic summoning broken up, pushing the warp back out of the sector.',
    factions: TAU,
    effects: [{ metric: 'chaos_corruption', delta: -5, target: 'battle' }],
  },
  {
    id: 'tau-win-populace',
    label: 'Won over the local populace',
    description: 'Civilians brought into the Greater Good, widening the T’au foothold.',
    factions: TAU,
    effects: [{ metric: 'tau_foothold', delta: 5, target: 'battle' }],
  },
  {
    id: 'tau-stealth-cadre',
    label: 'Established a stealth cadre',
    description: 'A covert cadre embedded in the war zone.',
    factions: TAU,
    effects: [{ metric: 'tau_foothold', delta: 3, target: 'battle' }],
  },

  // ── Other Xenos ──────────────────────────────────────────────────────────
  {
    id: 'ork-loot-haul',
    label: 'Looted a scrap haul',
    description: 'Wreckage stripped for teef and dakka.',
    factions: ORKS,
    effects: [{ metric: 'ork_foothold', delta: 5, target: 'battle' }],
  },
  {
    id: 'aeldari-webway-raid',
    label: 'Opened a webway raid',
    description: 'A webway portal anchored, granting the Aeldari free passage.',
    factions: AELDARI,
    effects: [{ metric: 'aeldari_foothold', delta: 5, target: 'battle' }],
  },
  {
    id: 'tyranid-consume-biomass',
    label: 'Consumed planetary biomass',
    description: 'The hive fleet digests another swathe of the planet.',
    factions: TYRANIDS,
    effects: [{ metric: 'tyranid_foothold', delta: 5, target: 'battle' }],
  },
  {
    id: 'genestealer-spread-infestation',
    label: 'Spread the infestation',
    description: 'New broods seeded among the population.',
    factions: GENESTEALER,
    effects: [{ metric: 'genestealer_foothold', delta: 5, target: 'battle' }],
  },

  // ── Imperium ─────────────────────────────────────────────────────────────
  {
    id: 'imperium-fortify',
    label: 'Reinforced Imperial defences',
    description: 'Fortifications raised and garrisons resupplied.',
    factions: IMPERIUM,
    effects: [{ metric: 'imperium_control', delta: 5, target: 'battle' }],
  },
  {
    id: 'imperium-purge',
    label: 'Purged a corrupted sector',
    description: 'Heretical influence burned out of the war zone.',
    factions: IMPERIUM,
    effects: [{ metric: 'chaos_corruption', delta: -5, target: 'battle' }],
  },

  // ── Chaos ────────────────────────────────────────────────────────────────
  {
    id: 'chaos-dark-ritual',
    label: 'Completed a dark ritual',
    description: 'The veil thins. Corruption spreads and Imperial order falters.',
    factions: CHAOS,
    effects: [
      { metric: 'chaos_corruption', delta: 5, target: 'battle' },
      { metric: 'imperium_control', delta: -5, target: 'battle' },
    ],
  },
  {
    id: 'chaos-despoil',
    label: 'Despoiled an Imperial holding',
    description: 'A shrine or manufactorum defiled.',
    factions: CHAOS,
    effects: [{ metric: 'imperium_control', delta: -3, target: 'battle' }],
  },
];

/** Deeds offered for a commander's army faction, plus any that apply to everyone. */
export function deedsForFaction(armyFaction?: string): Deed[] {
  if (!armyFaction) return CAMPAIGN_DEEDS.filter(d => d.factions.length === 0);
  return CAMPAIGN_DEEDS.filter(
    d => d.factions.length === 0 || d.factions.includes(armyFaction)
  );
}

/** 'The Ash Wastes - Nomad Trail' -> 'The Ash Wastes'. Mirrors the base-theatre match in SQL. */
export function baseTheatre(theatreName?: string | null): string {
  return (theatreName || '').split(' - ')[0].trim();
}

/** Resolve an effect's target to the territory name to write, or null for a campaign-wide tally. */
export function resolveTarget(effect: DeedEffect, matchTheatre?: string | null): string | null {
  if (effect.target === 'campaign') return null;
  if (effect.target === 'battle') return baseTheatre(matchTheatre) || null;
  return effect.target;
}

export const METRIC_LABELS: Record<AwardMetric, string> = {
  imperium_control: 'Imperium Control',
  chaos_corruption: 'Warp Corruption',
  ork_foothold: 'Ork Foothold',
  tau_foothold: "T'au Foothold",
  aeldari_foothold: 'Aeldari Foothold',
  necron_foothold: 'Necron Awakening',
  tyranid_foothold: 'Tyranid Foothold',
  genestealer_foothold: 'Genestealer Foothold',
  votann_resources: 'Votann Resources',
};
