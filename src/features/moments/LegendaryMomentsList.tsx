import { useEffect, useState } from 'react';
import { formatCommanderWithDiscord } from '../../utils/commanderUtils';
import { getFactionColor } from '../../components/TacticalSectorMap';
import { baseTheatre } from '../../data/theatres';
import { fetchApprovedMoments, type LegendaryMoment } from './legendaryMoments';

interface Props {
  /** Show only this commander's moments; omit for the whole campaign. */
  honouredId?: string;
  limit?: number;
  emptyText?: string;
}

/** Approved Legendary Moments, read-only. */
export default function LegendaryMomentsList({ honouredId, limit, emptyText }: Props) {
  const [moments, setMoments] = useState<LegendaryMoment[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchApprovedMoments(honouredId).then(m => { if (!cancelled) setMoments(m); });
    return () => { cancelled = true; };
  }, [honouredId]);

  if (moments === null) return null;
  const shown = limit ? moments.slice(0, limit) : moments;

  if (shown.length === 0) {
    return emptyText
      ? <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.9rem', margin: 0 }}>{emptyText}</p>
      : null;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {shown.map(m => {
        const color = getFactionColor(m.honoured?.army_faction);
        const where = baseTheatre(m.matchup?.theatre_name);
        return (
          <li key={m.id} style={{ borderLeft: `3px solid ${color}`, padding: '0.6rem 0.9rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', color: 'var(--theme-fg)' }}>★ {m.title}</div>
            <p style={{ margin: '0.35rem 0', fontStyle: 'italic', color: 'var(--theme-fg-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.description}</p>
            <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)' }}>
              <span style={{ color }}>{formatCommanderWithDiscord(m.honoured, 'Unknown commander')}</span>
              {m.matchup?.campaign_month ? ` · Round ${m.matchup.campaign_month}` : ''}
              {where ? ` · ${where}` : ''}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
