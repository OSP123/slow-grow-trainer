import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export interface MatchupData {
  id: string;
  p1_id: string;
  p2_id: string;
  p1_score?: number;
  p2_score?: number;
  p1_lore?: string;
  p2_lore?: string;
  game_result?: string;
  status?: string;
  p1_temperament?: number;
  p2_temperament?: number;
  p1_rules_engagement?: number;
  p2_rules_engagement?: number;
  p1_profile?: { commander_name: string };
  p2_profile?: { commander_name: string };
}

// Render filled/empty stars for display (read-only)
function StarDisplay({ value, size = '1rem' }: { value?: number; size?: string }) {
  if (!value) return <span style={{ color: 'var(--theme-fg-muted)', fontSize: '0.8rem' }}>Not rated</span>;
  return (
    <span style={{ fontSize: size, letterSpacing: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= value ? 'var(--theme-accent)' : 'var(--theme-border)' }}>★</span>
      ))}
    </span>
  );
}

// Interactive star input
function StarRating({ id, value, onChange }: { id: string; value: number | ''; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          id={`${id}-star-${star}`}
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '2rem',
            color: typeof value === 'number' && value >= star ? 'var(--theme-accent)' : 'var(--theme-border)',
            padding: '0',
            lineHeight: 1,
            transition: 'color 0.1s',
          }}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function CampaignBattles() {
  const [allMatchups, setAllMatchups] = useState<MatchupData[]>([]);
  const [myMatchups, setMyMatchups] = useState<MatchupData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  const [myScore, setMyScore] = useState<number | ''>('');
  const [oppScore, setOppScore] = useState<number | ''>('');
  const [myLore, setMyLore] = useState('');
  const [message, setMessage] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [oppTemperament, setOppTemperament] = useState<number | ''>('');
  const [oppRulesEngagement, setOppRulesEngagement] = useState<number | ''>('');

  const fetchBattles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data: all } = await supabase
      .from('matchups')
      .select('*, p1_profile:profiles!p1_id(commander_name), p2_profile:profiles!p2_id(commander_name)')
      .order('created_at', { ascending: false });

    if (all) {
      setAllMatchups(all);
      setMyMatchups(all.filter(m => m.p1_id === user.id || m.p2_id === user.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBattles();
  }, []);

  const handleSelectMatch = (m: MatchupData) => {
    setActiveMatch(m.id);
    setIsFinalizing(false);
    setMessage('');
    const isP1 = m.p1_id === userId;
    setMyScore(isP1 ? (m.p1_score ?? '') : (m.p2_score ?? ''));
    setOppScore(isP1 ? (m.p2_score ?? '') : (m.p1_score ?? ''));
    setMyLore(isP1 ? (m.p1_lore ?? '') : (m.p2_lore ?? ''));
    setOppTemperament(isP1 ? (m.p2_temperament ?? '') : (m.p1_temperament ?? ''));
    setOppRulesEngagement(isP1 ? (m.p2_rules_engagement ?? '') : (m.p1_rules_engagement ?? ''));
  };

  const handleSaveVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;
    const match = allMatchups.find(m => m.id === activeMatch);
    if (!match) return;
    const isP1 = match.p1_id === userId;

    type VPPayload = { p1_score?: number; p2_score?: number; p1_lore?: string; p2_lore?: string };
    const payload: VPPayload = {};
    if (isP1) {
      if (myScore !== '') payload.p1_score = myScore as number;
      if (oppScore !== '') payload.p2_score = oppScore as number;
      payload.p1_lore = myLore;
    } else {
      if (myScore !== '') payload.p2_score = myScore as number;
      if (oppScore !== '') payload.p1_score = oppScore as number;
      payload.p2_lore = myLore;
    }

    const { error } = await supabase.from('matchups').update(payload).eq('id', activeMatch);
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('VP scores updated. Keep fighting, Commander!');
      fetchBattles();
    }
  };

  const handleFinalizeMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;
    const match = allMatchups.find(m => m.id === activeMatch);
    if (!match) return;

    if (oppTemperament === '' || oppRulesEngagement === '') {
      setMessage('Command Temperament and Rules of Engagement ratings are required to seal this engagement.');
      return;
    }

    const isP1 = match.p1_id === userId;
    let gameResult = match.game_result;
    const ms = typeof myScore === 'number' ? myScore : null;
    const os = typeof oppScore === 'number' ? oppScore : null;
    if (ms !== null && os !== null) {
      if (ms > os) gameResult = isP1 ? 'p1_win' : 'p2_win';
      else if (os > ms) gameResult = isP1 ? 'p2_win' : 'p1_win';
      else gameResult = 'draw';
    }

    type FinalPayload = {
      status: string; game_result?: string;
      p1_score?: number; p2_score?: number;
      p1_lore?: string; p2_lore?: string;
      p1_temperament?: number; p2_temperament?: number;
      p1_rules_engagement?: number; p2_rules_engagement?: number;
    };

    const payload: FinalPayload = { status: 'completed', game_result: gameResult };
    if (isP1) {
      if (myScore !== '') payload.p1_score = myScore as number;
      if (oppScore !== '') payload.p2_score = oppScore as number;
      payload.p1_lore = myLore;
      payload.p2_temperament = oppTemperament as number;
      payload.p2_rules_engagement = oppRulesEngagement as number;
    } else {
      if (myScore !== '') payload.p2_score = myScore as number;
      if (oppScore !== '') payload.p1_score = oppScore as number;
      payload.p2_lore = myLore;
      payload.p1_temperament = oppTemperament as number;
      payload.p1_rules_engagement = oppRulesEngagement as number;
    }

    const { error } = await supabase.from('matchups').update(payload).eq('id', activeMatch);
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Battle report sealed. The Codex Administratum has been updated.');
      setActiveMatch(null);
      setIsFinalizing(false);
      fetchBattles();
    }
  };

  const getResultLabel = (m: MatchupData, uid: string | null) => {
    if (!m.game_result || !uid) return null;
    const isP1 = m.p1_id === uid;
    const won = (isP1 && m.game_result === 'p1_win') || (!isP1 && m.game_result === 'p2_win');
    const draw = m.game_result === 'draw';
    return { label: draw ? 'DRAW' : won ? 'VICTORY' : 'DEFEAT', color: draw ? '#aaa' : won ? '#4ade80' : '#f87171' };
  };

  const activeMatchData = allMatchups.find(m => m.id === activeMatch);
  const isP1Active = activeMatchData?.p1_id === userId;

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Locating Active Warzones...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Campaign Warzones</h1>
      <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '2rem' }}>
        Honour and conduct define a Commander. Battle scores are secondary — Command Temperament and Rules of Engagement are the true measure of a warrior.
      </p>

      {/* ── Global Warzone Board ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Global Warzone Board
        </h2>
        {allMatchups.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No engagements have been scheduled yet. Await orders from Command.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {allMatchups.map(m => {
              const result = getResultLabel(m, userId);
              return (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid var(--theme-border)',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    backgroundColor: 'var(--theme-bg-secondary)',
                    opacity: m.status === 'completed' ? 0.85 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {/* Status + Result */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px',
                      color: m.status === 'completed' ? 'var(--theme-fg-muted)' : 'var(--theme-accent)',
                    }}>
                      {m.status === 'completed' ? 'Concluded' : 'Active'}
                    </span>
                    {result && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: result.color, letterSpacing: '1px' }}>
                        {result.label}
                      </span>
                    )}
                  </div>

                  {/* Commanders */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{m.p1_profile?.commander_name || 'Unknown'}</span>
                    <span style={{ color: 'var(--theme-fg-muted)', fontSize: '0.8rem' }}>vs</span>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>{m.p2_profile?.commander_name || 'Unknown'}</span>
                  </div>

                  {/* ── PRIMARY: Command Temperament & Rules of Engagement ── */}
                  {m.status === 'completed' ? (
                    <div style={{
                      backgroundColor: 'var(--theme-bg)',
                      border: '1px solid var(--theme-accent)',
                      borderRadius: '6px',
                      padding: '0.75rem',
                    }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--theme-accent)', marginBottom: '0.5rem' }}>
                        Honour Ratings
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)', marginBottom: '2px' }}>{m.p1_profile?.commander_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>Temperament</div>
                          <StarDisplay value={m.p1_temperament} size="0.9rem" />
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)', marginTop: '4px' }}>Rules of Engagement</div>
                          <StarDisplay value={m.p1_rules_engagement} size="0.9rem" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)', marginBottom: '2px' }}>{m.p2_profile?.commander_name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>Temperament</div>
                          <StarDisplay value={m.p2_temperament} size="0.9rem" />
                          <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)', marginTop: '4px' }}>Rules of Engagement</div>
                          <StarDisplay value={m.p2_rules_engagement} size="0.9rem" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>
                      Honour ratings sealed upon completion
                    </div>
                  )}

                  {/* SECONDARY: VP Scores — visually smaller */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--theme-fg-muted)', borderTop: '1px solid var(--theme-border)', paddingTop: '0.5rem' }}>
                    <span>VP: {m.p1_score ?? '—'}</span>
                    <span style={{ color: 'var(--theme-fg-muted)' }}>score</span>
                    <span>VP: {m.p2_score ?? '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── My Frontlines + Detail Panel ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
            My Assigned Frontlines
          </h2>
          {myMatchups.length === 0 ? (
            <p style={{ color: 'var(--theme-fg-muted)' }}>No battles assigned to your command.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {myMatchups.map(m => {
                const isP1 = m.p1_id === userId;
                const myTemp = isP1 ? m.p1_temperament : m.p2_temperament;
                const myRules = isP1 ? m.p1_rules_engagement : m.p2_rules_engagement;
                const result = getResultLabel(m, userId);
                return (
                  <li
                    key={m.id}
                    onClick={() => handleSelectMatch(m)}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      border: '1px solid var(--theme-border)',
                      borderLeft: activeMatch === m.id ? '4px solid var(--theme-accent)' : '1px solid var(--theme-border)',
                      backgroundColor: activeMatch === m.id ? 'var(--theme-bg-secondary)' : 'transparent',
                      borderRadius: '4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Opponent name */}
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      vs {isP1 ? (m.p2_profile?.commander_name || 'Unknown') : (m.p1_profile?.commander_name || 'Unknown')}
                    </div>

                    {/* ── PRIMARY: My Honour ratings ── */}
                    {m.status === 'completed' && (myTemp || myRules) ? (
                      <div style={{ marginBottom: '0.25rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--theme-accent)', marginBottom: '2px' }}>Your Honour Ratings</div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--theme-fg-muted)' }}>Temperament</div>
                            <StarDisplay value={myTemp} size="0.75rem" />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--theme-fg-muted)' }}>Rules</div>
                            <StarDisplay value={myRules} size="0.75rem" />
                          </div>
                        </div>
                      </div>
                    ) : m.status !== 'completed' ? (
                      <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                        Honour pending
                      </div>
                    ) : null}

                    {/* SECONDARY: VP + status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginTop: '0.25rem' }}>
                      <span>VP: {(isP1 ? m.p1_score : m.p2_score) ?? '—'}</span>
                      {result && <span style={{ color: result.color, fontWeight: 'bold' }}>{result.label}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── Detail / Action Panel ── */}
        {activeMatchData ? (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
                {isP1Active ? activeMatchData.p1_profile?.commander_name : activeMatchData.p2_profile?.commander_name}
                {' '}<span style={{ color: 'var(--theme-fg-muted)', fontWeight: 'normal' }}>vs</span>{' '}
                {isP1Active ? activeMatchData.p2_profile?.commander_name : activeMatchData.p1_profile?.commander_name}
              </h2>
              {activeMatchData.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => { setIsFinalizing(!isFinalizing); setMessage(''); }}
                  className="btn"
                  style={{
                    fontSize: '0.8rem', padding: '0.4rem 1rem',
                    backgroundColor: isFinalizing ? 'var(--theme-bg-secondary)' : 'var(--theme-accent)',
                    color: isFinalizing ? 'var(--theme-fg)' : 'var(--theme-bg)',
                    border: '1px solid var(--theme-accent)',
                  }}
                >
                  {isFinalizing ? '← Back to VP Tracker' : 'Finalize Battle →'}
                </button>
              )}
              {activeMatchData.status === 'completed' && (
                <span style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)', letterSpacing: '1px' }}>SEALED</span>
              )}
            </div>

            {/* Completed match: show honour ratings as the primary display */}
            {activeMatchData.status === 'completed' && (
              <div style={{
                backgroundColor: 'var(--theme-bg-secondary)',
                border: '1px solid var(--theme-accent)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--theme-accent)', marginBottom: '1rem' }}>
                  ⚔ Honour Roll
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {[
                    { name: activeMatchData.p1_profile?.commander_name, temp: activeMatchData.p1_temperament, rules: activeMatchData.p1_rules_engagement },
                    { name: activeMatchData.p2_profile?.commander_name, temp: activeMatchData.p2_temperament, rules: activeMatchData.p2_rules_engagement },
                  ].map(p => (
                    <div key={p.name}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>{p.name}</div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Command Temperament</div>
                        <StarDisplay value={p.temp} size="1.25rem" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Rules of Engagement</div>
                        <StarDisplay value={p.rules} size="1.25rem" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* VP secondary under the honour panel */}
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--theme-border)', fontSize: '0.8rem', color: 'var(--theme-fg-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Battle Score — {activeMatchData.p1_profile?.commander_name}: {activeMatchData.p1_score ?? '—'} VP</span>
                  <span>{activeMatchData.p2_profile?.commander_name}: {activeMatchData.p2_score ?? '—'} VP</span>
                </div>
              </div>
            )}

            {!isFinalizing ? (
              /* ── Phase 1: Live VP Tracker ── */
              <form onSubmit={handleSaveVP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--theme-fg-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Live VP Tracker
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="myScore" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Your VP Score</label>
                    <input
                      id="myScore" type="number" min={0} value={myScore}
                      onChange={e => setMyScore(parseInt(e.target.value) || '')}
                      disabled={activeMatchData.status === 'completed'}
                      style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', opacity: activeMatchData.status === 'completed' ? 0.5 : 1 }}
                    />
                  </div>
                  <div>
                    <label htmlFor="oppScore" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Opponent VP Score</label>
                    <input
                      id="oppScore" type="number" min={0} value={oppScore}
                      onChange={e => setOppScore(parseInt(e.target.value) || '')}
                      disabled={activeMatchData.status === 'completed'}
                      style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', opacity: activeMatchData.status === 'completed' ? 0.5 : 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lore" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Narrative Perspective</label>
                  <textarea
                    id="lore" value={myLore} onChange={e => setMyLore(e.target.value)}
                    disabled={activeMatchData.status === 'completed'}
                    placeholder="Describe the flow of battle, key moments, lore implications..."
                    style={{
                      width: '100%', height: '100px', padding: '1rem',
                      backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)',
                      border: '1px solid var(--theme-border)', boxSizing: 'border-box',
                      opacity: activeMatchData.status === 'completed' ? 0.5 : 1,
                    }}
                  />
                </div>
                {activeMatchData.status !== 'completed' && (
                  <button type="submit" className="btn primary">Save VP Progress</button>
                )}
                {message && <div style={{ color: 'var(--theme-accent)', fontSize: '0.9rem' }}>{message}</div>}
              </form>
            ) : (
              /* ── Phase 2: Final Assessment — Honour ratings FIRST ── */
              <form onSubmit={handleFinalizeMatch} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-accent)', borderRadius: '6px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <strong style={{ color: 'var(--theme-accent)' }}>Honour ratings are the most important part of this report.</strong>
                    {' '}They are permanent and visible to all Commanders. Rate your opponent honestly on a scale of 1–5 stars.
                  </p>
                </div>

                {/* ── HONOUR RATINGS FIRST ── */}
                <div style={{ border: '1px solid var(--theme-accent)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--theme-accent)' }}>
                    ⚔ Rate Your Opponent's Honour
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
                      Command Temperament
                    </label>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>
                      Sportsmanship, attitude, and conduct during the engagement.
                    </p>
                    <StarRating id="temperament" value={oppTemperament} onChange={setOppTemperament} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
                      Rules of Engagement
                    </label>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>
                      How well your opponent knew and applied the rules of the game.
                    </p>
                    <StarRating id="rules" value={oppRulesEngagement} onChange={setOppRulesEngagement} />
                  </div>
                </div>

                {/* ── VP SCORES SECONDARY ── */}
                <div>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--theme-fg-muted)' }}>
                    Final VP Scores (secondary)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem' }}>Your VP</label>
                      <input type="number" min={0} value={myScore}
                        onChange={e => setMyScore(parseInt(e.target.value) || '')}
                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem' }}>Opponent VP</label>
                      <input type="number" min={0} value={oppScore}
                        onChange={e => setOppScore(parseInt(e.target.value) || '')}
                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="finalLore" style={{ display: 'block', marginBottom: '0.4rem' }}>Narrative Perspective</label>
                  <textarea
                    id="finalLore" value={myLore} onChange={e => setMyLore(e.target.value)}
                    placeholder="Final chronicle of this engagement..."
                    style={{
                      width: '100%', height: '80px', padding: '1rem',
                      backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)',
                      border: '1px solid var(--theme-border)', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button type="submit" className="btn primary" style={{ backgroundColor: '#b91c1c' }}>
                  ⚔ Seal Battle Report
                </button>
                {message && <div style={{ color: '#f87171', fontSize: '0.9rem' }}>{message}</div>}
              </form>
            )}
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-fg-muted)', minHeight: '200px' }}>
            Select an assigned frontline to upload tactical readouts.
          </div>
        )}
      </div>
    </div>
  );
}
