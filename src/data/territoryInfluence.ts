// Who holds a territory, derived from the raw scores in `public.territories`.
//
// Each faction's column is an uncapped score built by replaying the award
// ledger. Control is that score as a SHARE of the territory's total, so the
// shares always sum to 100% and one faction gaining ground means the others
// hold proportionally less. The largest share controls the territory.

import type { AwardMetric } from './campaignDeeds';

export type TerritoryMetric = Exclude<AwardMetric, 'votann_resources'>;

export interface TerritoryFaction {
  metric: TerritoryMetric;
  label: string;
  /** Army faction name, for getFactionColor. */
  colorFaction: string;
}

export const TERRITORY_FACTIONS: TerritoryFaction[] = [
  { metric: 'imperium_control', label: 'Imperium', colorFaction: 'Space Marines' },
  { metric: 'chaos_corruption', label: 'Chaos', colorFaction: 'Chaos Space Marines' },
  { metric: 'ork_foothold', label: 'Orks', colorFaction: 'Orks' },
  { metric: 'tau_foothold', label: "T'au Empire", colorFaction: "T'au Empire" },
  { metric: 'aeldari_foothold', label: 'Aeldari', colorFaction: 'Aeldari' },
  { metric: 'drukhari_foothold', label: 'Drukhari', colorFaction: 'Drukhari' },
  { metric: 'necron_foothold', label: 'Necrons', colorFaction: 'Necrons' },
  { metric: 'tyranid_foothold', label: 'Tyranids', colorFaction: 'Tyranids' },
  { metric: 'genestealer_foothold', label: 'Genestealer Cults', colorFaction: 'Genestealer Cults' },
  { metric: 'votann_foothold', label: 'Leagues of Votann', colorFaction: 'Leagues of Votann' },
];

export type TerritoryRow = Partial<Record<TerritoryMetric, number | null>>;

export interface InfluenceShare extends TerritoryFaction {
  score: number;
  /** Whole-number percentage. Shares across a territory sum to exactly 100 (or all 0). */
  share: number;
}

export interface TerritoryInfluence {
  /** Factions with any presence, largest share first. */
  shares: InfluenceShare[];
  /** The faction with the largest share; null when tied at the top or nobody holds anything. */
  controller: InfluenceShare | null;
}

export function territoryInfluence(row: TerritoryRow): TerritoryInfluence {
  const scored = TERRITORY_FACTIONS.map(f => ({ ...f, score: Math.max(0, row[f.metric] ?? 0) }));
  const total = scored.reduce((sum, f) => sum + f.score, 0);
  if (total === 0) return { shares: [], controller: null };

  // Largest-remainder rounding, so the displayed percentages add up to 100.
  const exact = scored.map(f => (f.score / total) * 100);
  const shares = exact.map(Math.floor);
  let remaining = 100 - shares.reduce((a, b) => a + b, 0);
  const byRemainder = exact
    .map((v, i) => ({ i, rem: v - Math.floor(v) }))
    .sort((a, b) => b.rem - a.rem);
  for (const { i } of byRemainder) {
    if (remaining <= 0) break;
    shares[i] += 1;
    remaining -= 1;
  }

  // Sort is stable, so ties keep TERRITORY_FACTIONS order.
  const present = scored
    .map((f, i) => ({ ...f, share: shares[i] }))
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score);

  const [top, runnerUp] = present;
  const controller = runnerUp && runnerUp.score === top.score ? null : top;
  return { shares: present, controller };
}
