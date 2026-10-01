import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { formatCommanderWithDiscord } from '../../utils/commanderUtils';
import {
  deedsForFaction,
  resolveTarget,
  baseTheatre,
  METRIC_LABELS,
  type Deed,
  type AwardMetric,
} from '../../data/campaignDeeds';

interface Profile {
  commander_name: string;
  army_faction?: string;
  discord_name?: string;
}

interface ReportMatchup {
  id: string;
  p1_id: string;
  p2_id: string | null;
  campaign_month?: number;
  theatre_name?: string;
  status?: string;
  uncontested?: boolean;
  p1_lore?: string;
  p2_lore?: string;
  p1_tldr?: string;
  p2_tldr?: string;
  p1_profile?: Profile;
  p2_profile?: Profile;
}

interface Award {
  id: string;
  matchup_id: string;
  commander_id: string;
  deed: string;
  metric: AwardMetric;
  territory_name: string | null;
  delta: number;
  created_at: string;
}

const hasText = (v?: string) => !!(v && v.trim());

/** Commanders are credited for what their report describes, so a side with no report has nothing to adjudicate. */
function sideHasReport(m: ReportMatchup, isP1: boolean) {
  return isP1 ? hasText(m.p1_lore) || hasText(m.p1_tldr) : hasText(m.p2_lore) || hasText(m.p2_tldr);
}

export default function ReportAdjudication() {
  const [matchups, setMatchups] = useState<ReportMatchup[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [onlyUnadjudicated, setOnlyUnadjudicated] = useState(false);
  const [pendingDeed, setPendingDeed] = useState<Record<string, string>>({});

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setAdminId(user.id);

    const { data: ms } = await supabase
      .from('matchups')
      .select('id, p1_id, p2_id, campaign_month, theatre_name, status, uncontested, p1_lore, p2_lore, p1_tldr, p2_tldr, p1_profile:profiles!p1_id(commander_name, discord_name, army_faction), p2_profile:profiles!p2_id(commander_name, discord_name, army_faction)')
      .order('created_at', { ascending: false });

    if (ms) {
      setMatchups(
        (ms as unknown as ReportMatchup[]).filter(
          m => m.status === 'completed' || m.status === 'verified'
        )
      );
    }

    const { data: aws } = await supabase.from('campaign_awards').select('*');
    if (aws) setAwards(aws as Award[]);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, []);

  const awardsFor = (matchupId: string, commanderId?: string) =>
    awards.filter(a => a.matchup_id === matchupId && (!commanderId || a.commander_id === commanderId));

  const handleAward = async (m: ReportMatchup, commanderId: string, deed: Deed) => {
    setMessage('');
    // One row per effect, so each can be withdrawn independently.
    const rows = deed.effects.map(effect => ({
      matchup_id: m.id,
      commander_id: commanderId,
      deed: deed.label,
      metric: effect.metric,
      territory_name: resolveTarget(effect, m.theatre_name),
      delta: effect.delta,
      awarded_by: adminId,
    }));

    const missingTerritory = rows.find(r => r.metric !== 'votann_resources' && !r.territory_name);
    if (missingTerritory) {
      setMessage(`Cannot award "${deed.label}": this match has no recognisable war zone.`);
      return;
    }

    const { error } = await supabase.from('campaign_awards').insert(rows);
    if (error) {
      setMessage('Error awarding deed: ' + error.message);
    } else {
      setMessage(`Awarded "${deed.label}". The campaign map has been recalculated.`);
      fetchAll();
    }
  };

  const handleWithdraw = async (award: Award) => {
    setMessage('');
    const { error } = await supabase.from('campaign_awards').delete().eq('id', award.id);
    if (error) {
      setMessage('Error withdrawing award: ' + error.message);
    } else {
      setMessage('Award withdrawn. The campaign map has been recalculated.');
      fetchAll();
    }
  };

  const reportable = matchups.filter(m => sideHasReport(m, true) || sideHasReport(m, false));
  const visible = onlyUnadjudicated
    ? reportable.filter(m => awardsFor(m.id).length === 0)
    : reportable;

  const active = visible.find(m => m.id === activeId) || null;

  if (loading) return <p style={{ color: 'var(--theme-fg-muted)' }}>Reading submitted battle reports...</p>;

  const renderSide = (m: ReportMatchup, isP1: boolean) => {
    const commanderId = isP1 ? m.p1_id : m.p2_id;
    const profile = isP1 ? m.p1_profile : m.p2_profile;
    if (!commanderId) return null;
    if (!sideHasReport(m, isP1)) return null;

    const lore = isP1 ? m.p1_lore : m.p2_lore;
    const tldr = isP1 ? m.p1_tldr : m.p2_tldr;
    const available = deedsForFaction(profile?.army_faction);
    const granted = awardsFor(m.id, commanderId);
    const selected = pendingDeed[commanderId] || '';

    return (
      <div style={{ border: '1px solid var(--theme-border)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <strong>{formatCommanderWithDiscord(profile, 'Unknown')}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--theme-accent)' }}>{profile?.army_faction || 'No Faction'}</span>
        </div>

        {hasText(tldr) && (
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--theme-accent)', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.7rem', color: 'var(--theme-accent)', display: 'block' }}>TL;DR</strong>
            <span>{tldr}</span>
          </div>
        )}
        {hasText(lore) && (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '4px', maxHeight: '260px', overflowY: 'auto', marginBottom: '0.75rem' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'var(--theme-fg-muted)', lineHeight: 1.6 }}>{lore}</p>
          </div>
        )}

        {granted.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--theme-accent)', marginBottom: '0.4rem' }}>
              Awarded
            </div>
            {granted.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid var(--theme-border)' }}>
                <span>
                  {a.deed} — <strong style={{ color: a.delta < 0 ? '#60a5fa' : '#4ade80' }}>
                    {a.delta > 0 ? '+' : ''}{a.delta} {METRIC_LABELS[a.metric]}
                  </strong>
                  {a.territory_name ? <span style={{ color: 'var(--theme-fg-muted)' }}> @ {a.territory_name}</span> : null}
                </span>
                <button
                  onClick={() => handleWithdraw(a)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            aria-label={`Deed for ${profile?.commander_name || 'commander'}`}
            value={selected}
            onChange={e => setPendingDeed(prev => ({ ...prev, [commanderId]: e.target.value }))}
            style={{ flex: '1 1 260px', padding: '0.5rem', boxSizing: 'border-box' }}
          >
            <option value="">Select a deed described in this report...</option>
            {available.map(d => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.effects.map(e => `${e.delta > 0 ? '+' : ''}${e.delta} ${METRIC_LABELS[e.metric]}`).join(', ')})
              </option>
            ))}
          </select>
          <button
            className="btn primary"
            disabled={!selected}
            onClick={() => {
              const deed = available.find(d => d.id === selected);
              if (deed) {
                handleAward(m, commanderId, deed);
                setPendingDeed(prev => ({ ...prev, [commanderId]: '' }));
              }
            }}
            style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
          >
            Award Deed
          </button>
        </div>
        {available.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            No deeds are defined for {profile?.army_faction || 'this faction'} yet. Add one in <code>src/data/campaignDeeds.ts</code>.
          </p>
        )}
      </div>
    );
  };

  return (
    <div id="report-adjudication-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--theme-border)' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Battle Report Adjudication</h3>
      <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        The campaign map is driven by the deeds commanders describe, not by who won. Read each
        submitted report and award the deeds it describes. Awards can be withdrawn at any time —
        the map is recalculated from the full ledger every time it changes.
      </p>

      {message && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
          {message}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={onlyUnadjudicated}
          onChange={e => setOnlyUnadjudicated(e.target.checked)}
        />
        Show only reports with no awards yet ({reportable.filter(m => awardsFor(m.id).length === 0).length} of {reportable.length})
      </label>

      {visible.length === 0 ? (
        <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem' }}>No submitted battle reports to adjudicate.</p>
      ) : (
        <div className="adjudication-layout">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
            {visible.map(m => {
              const count = awardsFor(m.id).length;
              return (
                <li
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    border: '1px solid var(--theme-border)',
                    borderLeft: activeId === m.id ? '4px solid var(--theme-accent)' : '1px solid var(--theme-border)',
                    backgroundColor: activeId === m.id ? 'var(--theme-bg-secondary)' : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {formatCommanderWithDiscord(m.p1_profile, 'Unknown')}
                    {m.p2_id ? ` vs ${formatCommanderWithDiscord(m.p2_profile, 'Unknown')}` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginTop: '2px' }}>
                    Phase {m.campaign_month || 1} · {baseTheatre(m.theatre_name) || 'Undeployed'}
                  </div>
                  <div style={{ fontSize: '0.7rem', marginTop: '4px', color: count > 0 ? '#4ade80' : '#f59e0b' }}>
                    {count > 0 ? `${count} award${count === 1 ? '' : 's'}` : 'Not yet adjudicated'}
                  </div>
                </li>
              );
            })}
          </ul>

          <div>
            {!active ? (
              <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem' }}>Select a battle report to adjudicate.</p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--theme-accent)' }}>
                  <strong>War zone:</strong> {active.theatre_name || 'Undeployed'}
                  {baseTheatre(active.theatre_name) && (
                    <span style={{ color: 'var(--theme-fg-muted)' }}> — deeds land on {baseTheatre(active.theatre_name)}</span>
                  )}
                </div>
                {renderSide(active, true)}
                {renderSide(active, false)}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
