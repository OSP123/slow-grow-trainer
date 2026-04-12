import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function CampaignBattles() {
  const [matchups, setMatchups] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [activeMatch, setActiveMatch] = useState<string | null>(null);
  const [myScore, setMyScore] = useState<number | ''>('');
  const [myLore, setMyLore] = useState('');
  const [oppScore, setOppScore] = useState<number | ''>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchActiveBattles();
  }, []);

  const fetchActiveBattles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Fetch matchups involving this user
    const { data } = await supabase
      .from('matchups')
      .select('*, p1_profile:profiles!p1_id(commander_name), p2_profile:profiles!p2_id(commander_name)')
      .or(`p1_id.eq.${user.id},p2_id.eq.${user.id}`);

    if (data) setMatchups(data);
    setLoading(false);
  };

  const handleSelectMatch = (m: any) => {
    setActiveMatch(m.id);
    const isP1 = m.p1_id === userId;
    setMyScore(isP1 ? (m.p1_score ?? '') : (m.p2_score ?? ''));
    setOppScore(isP1 ? (m.p2_score ?? '') : (m.p1_score ?? ''));
    setMyLore(isP1 ? (m.p1_lore ?? '') : (m.p2_lore ?? ''));
    setMessage('');
  };

  const handleCommitGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;

    const match = matchups.find(m => m.id === activeMatch);
    if (!match) return;

    const isP1 = match.p1_id === userId;
    
    let gameResult = match.game_result;
    
    // Auto-calculate structural Win/Loss/Draw
    if (typeof myScore === 'number' && typeof oppScore === 'number') {
      if (myScore > oppScore) gameResult = isP1 ? 'p1_win' : 'p2_win';
      else if (oppScore > myScore) gameResult = isP1 ? 'p2_win' : 'p1_win';
      else gameResult = 'draw';
    }

    const payload: any = { game_result: gameResult };
    
    if (isP1) {
      payload.p1_score = myScore;
      payload.p2_score = oppScore;
      payload.p1_lore = myLore;
    } else {
      payload.p2_score = myScore;
      payload.p1_score = oppScore;
      payload.p2_lore = myLore;
    }

    // Attempt partial update (Trust system where both users can update the row concurrently)
    const { error } = await supabase.from('matchups').update(payload).eq('id', activeMatch);
    
    if (error) {
      setMessage('Postgres constraint intercepted: ' + error.message);
    } else {
      setMessage('Tactical Action Report logged natively to the system.');
      fetchActiveBattles();
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Locating Active Warzones...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Active Campaign Matchups</h1>
      <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '2rem' }}>
        Log into your assigned Warzones below. Both commanders can formally edit the VP spread, but write your own unique After-Action Report!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>Assigned Frontlines</h2>
          {matchups.length === 0 ? (
            <p style={{ color: 'var(--theme-fg-muted)' }}>No battles currently generated.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {matchups.map(m => (
                <li 
                  key={m.id} 
                  onClick={() => handleSelectMatch(m)}
                  style={{ 
                    padding: '1rem', 
                    marginBottom: '0.5rem', 
                    cursor: 'pointer',
                    backgroundColor: activeMatch === m.id ? 'var(--theme-bg-secondary)' : 'transparent',
                    border: '1px solid var(--theme-border)',
                    borderLeft: activeMatch === m.id ? '4px solid var(--theme-accent)' : '1px solid var(--theme-border)'
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{m.p1_profile?.commander_name || 'Classified'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--theme-accent)', margin: '0.25rem 0' }}>VS</div>
                  <div style={{ fontWeight: 'bold' }}>{m.p2_profile?.commander_name || 'Classified'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {activeMatch ? (
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>After-Action Intel Log</h2>
            <form onSubmit={handleCommitGame} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="myScore" style={{ display: 'block', marginBottom: '0.5rem' }}>Your Game Score (VP)</label>
                  <input 
                    id="myScore"
                    type="number" 
                    value={myScore}
                    onChange={(e) => setMyScore(parseInt(e.target.value) || '')}
                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="oppScore" style={{ display: 'block', marginBottom: '0.5rem' }}>Opponent Game Score (VP)</label>
                  <input 
                    id="oppScore"
                    type="number" 
                    value={oppScore}
                    onChange={(e) => setOppScore(parseInt(e.target.value) || '')}
                    style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lore" style={{ display: 'block', marginBottom: '0.5rem' }}>Your Force's Narrative Perspective</label>
                <textarea 
                  id="lore"
                  value={myLore}
                  onChange={(e) => setMyLore(e.target.value)}
                  placeholder="Record your tactical maneuvers and lore implications here..."
                  style={{ width: '100%', height: '150px', padding: '1rem', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border)', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" className="btn primary">Commit Military Report</button>
              {message && <div style={{ color: 'var(--theme-accent)' }}>{message}</div>}
            </form>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-fg-muted)' }}>
            Select a Warzone to upload tactical readouts.
          </div>
        )}
      </div>
    </div>
  );
}
