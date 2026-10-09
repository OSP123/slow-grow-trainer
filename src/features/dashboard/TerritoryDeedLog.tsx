import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { formatCommanderWithDiscord } from '../../utils/commanderUtils';
import { getFactionColor } from '../../components/TacticalSectorMap';
import { METRIC_LABELS } from '../../data/campaignDeeds';
import { deedsForTerritory, type AwardRow } from './territoryDeeds';

/** "Deeds that shaped this war zone": why the influence bars look the way they do. */
export default function TerritoryDeedLog({ territory }: { territory: string }) {
  const [rows, setRows] = useState<AwardRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('campaign_awards')
          .select('id, matchup_id, commander_id, deed, metric, territory_name, delta, created_at, ' +
            'commander:profiles!commander_id(commander_name, army_faction, discord_name), ' +
            'matchup:matchups!matchup_id(campaign_month, theatre_name)')
          .eq('territory_name', territory);
        if (!cancelled) setRows((data ?? []) as unknown as AwardRow[]);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => { cancelled = true; };
  }, [territory]);

  if (rows === null) return null;
  const entries = deedsForTerritory(rows, territory);

  return (
    <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--theme-border)' }}>
      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--theme-fg-muted)' }}>
        Deeds that shaped this war zone
      </h4>
      {entries.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-fg-muted)' }}>
          No deeds credited here yet. Control shifts as Campaign Command credits the deeds described in battle reports.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
          {entries.map(e => (
            <li key={e.key} style={{ fontSize: '0.85rem', lineHeight: 1.4, paddingLeft: '0.6rem', borderLeft: `3px solid ${getFactionColor(e.commander?.army_faction)}` }}>
              <strong>{e.deed}</strong>
              <span style={{ color: 'var(--theme-fg-muted)' }}>
                {' — '}{formatCommanderWithDiscord(e.commander, 'Unknown commander')}
                {e.round ? `, Round ${e.round}` : ''}
                {e.foughtIn ? ` (battle in ${e.foughtIn})` : ''}
              </span>
              <div style={{ fontSize: '0.75rem' }}>
                {e.effects.map((f, i) => (
                  <span key={i} style={{ marginRight: '0.75rem', color: f.delta < 0 ? '#60a5fa' : '#4ade80' }}>
                    {f.delta > 0 ? '+' : ''}{f.delta} {METRIC_LABELS[f.metric]}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
