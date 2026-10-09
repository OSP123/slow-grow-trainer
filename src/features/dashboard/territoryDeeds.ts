// Fold the campaign award ledger into the deeds that shaped one war zone.

import { baseTheatre } from '../../data/theatres';
import type { AwardMetric } from '../../data/campaignDeeds';

export interface AwardRow {
  id: string;
  matchup_id: string | null;
  commander_id: string | null;
  deed: string;
  metric: AwardMetric;
  territory_name: string | null;
  delta: number;
  created_at: string;
  commander?: { commander_name: string; army_faction?: string; discord_name?: string } | null;
  matchup?: { campaign_month?: number; theatre_name?: string } | null;
}

export interface DeedEntry {
  key: string;
  deed: string;
  commander: AwardRow['commander'];
  round?: number;
  /** Where the battle was fought, when that differs from this territory (e.g. a tomb stirring the Sump). */
  foughtIn?: string;
  effects: { metric: AwardMetric; delta: number }[];
}

/**
 * The ledger rows landing on one territory, folded so a deed with several
 * effects here (a ritual: +Chaos, -Imperium) reads as one entry. Newest first.
 */
export function deedsForTerritory(rows: AwardRow[], territory: string): DeedEntry[] {
  const entries = new Map<string, DeedEntry>();
  const ordered = rows
    .filter(r => r.territory_name === territory)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  for (const r of ordered) {
    const key = `${r.matchup_id}|${r.commander_id}|${r.deed}`;
    let entry = entries.get(key);
    if (!entry) {
      const fought = baseTheatre(r.matchup?.theatre_name);
      entry = {
        key,
        deed: r.deed,
        commander: r.commander,
        round: r.matchup?.campaign_month,
        foughtIn: fought && fought !== territory ? fought : undefined,
        effects: [],
      };
      entries.set(key, entry);
    }
    entry.effects.push({ metric: r.metric, delta: r.delta });
  }
  return [...entries.values()];
}
