import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { generateMatchups, type MatchPair } from './Matchmaker';
import { UNITS_BY_FACTION, getFactionsGrouped } from '../../data/warhammer40k';

export interface UnitPoint {
  id: string;
  faction: string;
  unit_name: string;
  base_points: number;
  updated_at: string;
}

export interface CampaignVote {
  id: string;
  category: string;
  nominee_id: string;
  voter_id: string;
  profiles?: { commander_name: string };
}

export interface GameStore {
  id: string;
  name: string;
  location?: string;
}

interface EditableMatchup {
  id: string;
  p1_id: string;
  p2_id: string;
  p1_score: number | '';
  p2_score: number | '';
  game_result: string;
  status: string;
  p1_temperament: number | '';
  p2_temperament: number | '';
  p1_rules_engagement: number | '';
  p2_rules_engagement: number | '';
  p1_profile?: { commander_name: string };
  p2_profile?: { commander_name: string };
}

export default function AdminDashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');

  const [votes, setVotes] = useState<CampaignVote[]>([]);
  const [fetchingVotes, setFetchingVotes] = useState(false);

  const [generatedMatches, setGeneratedMatches] = useState<MatchPair[]>([]);
  const [committingMatches, setCommittingMatches] = useState(false);

  const [stores, setStores] = useState<GameStore[]>([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreLoc, setNewStoreLoc] = useState('');

  // Matchup management
  const [allMatchups, setAllMatchups] = useState<EditableMatchup[]>([]);
  const [editingMatchup, setEditingMatchup] = useState<EditableMatchup | null>(null);
  const [matchupMessage, setMatchupMessage] = useState('');

  // Unit Points management
  const [unitPoints, setUnitPoints] = useState<UnitPoint[]>([]);
  const [fetchingUP, setFetchingUP] = useState(false);
  const [newUPFaction, setNewUPFaction] = useState('');
  const [newUPUnit, setNewUPUnit] = useState('');
  const [newUPPoints, setNewUPPoints] = useState<number | ''>('');
  const [upMessage, setUPMessage] = useState('');

  const GROUPED_FACTIONS = getFactionsGrouped();
  const ALLIANCE_ORDER: ('Imperium' | 'Chaos' | 'Xenos')[] = ['Imperium', 'Chaos', 'Xenos'];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || null);
      setLoading(false);
    });
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === 'TERMINUS_ROOT') {
      setUnlocked(true);
      fetchVotes();
      fetchStores();
      fetchAllMatchups();
      fetchUnitPoints();
    } else {
      alert('Access Denied. Incorrect Phase Code.');
    }
  };

  const fetchStores = async () => {
    const { data } = await supabase.from('game_stores').select('*').order('name');
    if (data) setStores(data);
  };

  const fetchVotes = async () => {
    setFetchingVotes(true);
    const { data, error } = await supabase.from('campaign_votes').select('*, profiles:profiles!campaign_votes_nominee_id_fkey(commander_name)');
    if (!error && data) setVotes(data);
    setFetchingVotes(false);
  };

  const fetchAllMatchups = async () => {
    const { data } = await supabase
      .from('matchups')
      .select('*, p1_profile:profiles!p1_id(commander_name), p2_profile:profiles!p2_id(commander_name)')
      .order('created_at', { ascending: false });
    if (data) setAllMatchups(data.map(m => ({
      ...m,
      p1_score: m.p1_score ?? '',
      p2_score: m.p2_score ?? '',
      p1_temperament: m.p1_temperament ?? '',
      p2_temperament: m.p2_temperament ?? '',
      p1_rules_engagement: m.p1_rules_engagement ?? '',
      p2_rules_engagement: m.p2_rules_engagement ?? '',
      game_result: m.game_result ?? '',
      status: m.status ?? 'scheduled',
    })));
  };

  const handleGenerateMatches = async () => {
    const { data } = await supabase.from('profiles').select('id, location, experience_level, army_faction, commander_name').eq('role', 'user');
    if (data) {
      const pairings = generateMatchups(data);
      setGeneratedMatches(pairings);
    }
  };

  const commitMatches = async () => {
    if (generatedMatches.length === 0) return;
    setCommittingMatches(true);
    const payload = generatedMatches.map(m => ({ p1_id: m.p1.id, p2_id: m.p2.id, status: 'scheduled' }));
    const { error } = await supabase.from('matchups').insert(payload);
    if (!error) {
      alert('Matchups actively committed to the Ledger!');
      setGeneratedMatches([]);
      fetchAllMatchups();
    } else {
      alert('Error committing Matchups.');
    }
    setCommittingMatches(false);
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;
    await supabase.from('game_stores').insert({ name: newStoreName, location: newStoreLoc });
    setNewStoreName(''); setNewStoreLoc('');
    fetchStores();
  };

  const handleDeleteStore = async (storeId: string) => {
    await supabase.from('game_stores').delete().eq('id', storeId);
    fetchStores();
  };

  const handleEditMatchup = (m: EditableMatchup) => {
    setEditingMatchup({ ...m });
    setMatchupMessage('');
  };

  const handleSaveMatchup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatchup) return;

    type MatchupPayload = {
      p1_score?: number | null;
      p2_score?: number | null;
      game_result?: string | null;
      status: string;
      p1_temperament?: number | null;
      p2_temperament?: number | null;
      p1_rules_engagement?: number | null;
      p2_rules_engagement?: number | null;
    };

    const payload: MatchupPayload = {
      p1_score: editingMatchup.p1_score !== '' ? editingMatchup.p1_score as number : null,
      p2_score: editingMatchup.p2_score !== '' ? editingMatchup.p2_score as number : null,
      game_result: editingMatchup.game_result || null,
      status: editingMatchup.status,
      p1_temperament: editingMatchup.p1_temperament !== '' ? editingMatchup.p1_temperament as number : null,
      p2_temperament: editingMatchup.p2_temperament !== '' ? editingMatchup.p2_temperament as number : null,
      p1_rules_engagement: editingMatchup.p1_rules_engagement !== '' ? editingMatchup.p1_rules_engagement as number : null,
      p2_rules_engagement: editingMatchup.p2_rules_engagement !== '' ? editingMatchup.p2_rules_engagement as number : null,
    };

    const { error } = await supabase.from('matchups').update(payload).eq('id', editingMatchup.id);
    if (error) {
      setMatchupMessage('Error: ' + error.message);
    } else {
      setMatchupMessage('Matchup record updated.');
      setEditingMatchup(null);
      fetchAllMatchups();
    }
  };

  const handleDeleteMatchup = async (matchupId: string) => {
    const { error } = await supabase.from('matchups').delete().eq('id', matchupId);
    if (!error) fetchAllMatchups();
  };

  const fetchUnitPoints = async () => {
    setFetchingUP(true);
    const { data } = await supabase.from('unit_points').select('*').order('faction').order('unit_name');
    if (data) setUnitPoints(data);
    setFetchingUP(false);
  };

  const handleAddUnitPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUPFaction || !newUPUnit || newUPPoints === '') {
      setUPMessage('Faction, Unit, and Points are required.');
      return;
    }

    const { error } = await supabase.from('unit_points').upsert({
      faction: newUPFaction,
      unit_name: newUPUnit,
      base_points: newUPPoints
    }, { onConflict: 'faction,unit_name' });

    if (error) {
      setUPMessage('Error: ' + error.message);
    } else {
      setUPMessage(`Successfully registered ${newUPUnit} (${newUPPoints} pts).`);
      setNewUPUnit('');
      setNewUPPoints('');
      fetchUnitPoints();
    }
  };

  const handleDeleteUnitPoint = async (id: string) => {
    if (!confirm('Are you sure you want to remove this unit from the point registry?')) return;
    const { error } = await supabase.from('unit_points').delete().eq('id', id);
    if (!error) fetchUnitPoints();
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Scanning biometric signatures...</div>;

  if (email !== 'omarpatel123@gmail.com') {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', border: '1px solid red' }}>
        <h2 style={{ color: 'red' }}>UNAUTHORIZED: Clearance Denied</h2>
        <p>This path exists strictly for root-level simulation overrides.</p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Root Admin Gateway</h2>
        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="code">Security Code</label>
            <input id="code" type="password" placeholder="Enter Admin Override Code" value={code}
              onChange={e => setCode(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" className="btn primary">Unlock Root Access</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Administration Override Station</h1>

      {/* ── MATCHUP MANAGEMENT ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Matchup Command Override</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem' }}>
          Edit scores, result, status, and honour ratings for any matchup. Changes override player submissions.
        </p>

        {matchupMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {matchupMessage}
          </div>
        )}

        {/* Edit form */}
        {editingMatchup && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid var(--theme-accent)', borderRadius: '6px', backgroundColor: 'var(--theme-bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                Editing: {editingMatchup.p1_profile?.commander_name} vs {editingMatchup.p2_profile?.commander_name}
              </h3>
              <button onClick={() => setEditingMatchup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--theme-fg-muted)' }}>✕ Cancel</button>
            </div>
            <form onSubmit={handleSaveMatchup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>
                    {editingMatchup.p1_profile?.commander_name} VP
                  </label>
                  <input type="number" min={0}
                    value={editingMatchup.p1_score}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, p1_score: parseInt(e.target.value) || '' } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>
                    {editingMatchup.p2_profile?.commander_name} VP
                  </label>
                  <input type="number" min={0}
                    value={editingMatchup.p2_score}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, p2_score: parseInt(e.target.value) || '' } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Result</label>
                  <select
                    value={editingMatchup.game_result}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, game_result: e.target.value } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    <option value="">— None —</option>
                    <option value="p1_win">{editingMatchup.p1_profile?.commander_name} Wins</option>
                    <option value="p2_win">{editingMatchup.p2_profile?.commander_name} Wins</option>
                    <option value="draw">Draw</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Status</label>
                  <select
                    value={editingMatchup.status}
                    onChange={e => setEditingMatchup(prev => prev ? { ...prev, status: e.target.value } : null)}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Honour Ratings (1–5)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {[
                  { key: 'p1_temperament' as const, label: `${editingMatchup.p1_profile?.commander_name} Temperament` },
                  { key: 'p1_rules_engagement' as const, label: `${editingMatchup.p1_profile?.commander_name} Rules` },
                  { key: 'p2_temperament' as const, label: `${editingMatchup.p2_profile?.commander_name} Temperament` },
                  { key: 'p2_rules_engagement' as const, label: `${editingMatchup.p2_profile?.commander_name} Rules` },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>{label}</label>
                    <input type="number" min={1} max={5}
                      value={editingMatchup[key]}
                      onChange={e => setEditingMatchup(prev => prev ? { ...prev, [key]: parseInt(e.target.value) || '' } : null)}
                      style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn primary" style={{ alignSelf: 'flex-start' }}>Save Override</button>
            </form>
          </div>
        )}

        {/* Matchup List */}
        {allMatchups.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No matchups in the ledger yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Player 1</th>
                <th style={{ padding: '0.5rem' }}>Player 2</th>
                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Score</th>
                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Result</th>
                <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.5rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {allMatchups.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{m.p1_profile?.commander_name || '—'}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{m.p2_profile?.commander_name || '—'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>
                    {m.p1_score !== '' ? m.p1_score : '—'} : {m.p2_score !== '' ? m.p2_score : '—'}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--theme-fg-muted)' }}>
                    {m.game_result || '—'}
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem', letterSpacing: '1px', padding: '2px 8px', borderRadius: '3px',
                      backgroundColor: m.status === 'completed' ? '#166534' : m.status === 'verified' ? '#1e40af' : '#713f12',
                      color: '#fff',
                    }}>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEditMatchup(m)} className="btn secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteMatchup(m.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MATCHMAKING ENGINE ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Matchmaking Engine Override</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Automatically pairs commanders globally across Locations, Experience Tiers, and Army differences.
        </p>
        <button onClick={handleGenerateMatches} className="btn secondary" style={{ marginBottom: '1rem' }}>
          Simulate Pairings via Algorithm
        </button>
        {generatedMatches.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--theme-border)' }}>
            <h3>Proposed Round Ledgers</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
              {generatedMatches.map((m, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>
                  <strong>{m.p1.commander_name || 'Unknown'}</strong> ({m.p1.location || '?'}, {m.p1.experience_level})
                  <span style={{ color: 'red', margin: '0 0.5rem' }}>VS</span>
                  <strong>{m.p2.commander_name || 'Unknown'}</strong> ({m.p2.location || '?'}, {m.p2.experience_level})
                  <span style={{ fontSize: '0.8rem', color: 'gray', marginLeft: '0.5rem' }}>[Score: {m.score}]</span>
                </li>
              ))}
            </ul>
            <button onClick={commitMatches} disabled={committingMatches} className="btn primary">
              {committingMatches ? 'Committing to Postgres...' : 'Lock Initial Pairings'}
            </button>
          </div>
        )}
      </div>

      {/* ── SANCTIONED VENUES ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Sanctioned Venue Control (Game Stores)</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Manage global store endpoints where physical operations map via Registration forms.
        </p>
        <form onSubmit={handleAddStore} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <input type="text" placeholder="Store Name" value={newStoreName}
            onChange={e => setNewStoreName(e.target.value)} required style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }} />
          <input type="text" placeholder="Location (Optional)" value={newStoreLoc}
            onChange={e => setNewStoreLoc(e.target.value)} style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }} />
          <button type="submit" className="btn primary">Add Venue</button>
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {stores.length === 0 && <span style={{ color: 'var(--theme-fg-muted)' }}>No Active Stores Connected...</span>}
          {stores.map(store => (
            <li key={store.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--theme-border)' }}>
              <div>
                <strong>{store.name}</strong>
                {store.location && <span style={{ color: 'var(--theme-fg-muted)', marginLeft: '0.5rem' }}>({store.location})</span>}
              </div>
              <button onClick={() => handleDeleteStore(store.id)}
                style={{ backgroundColor: 'transparent', color: 'red', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── MUNITORUM FIELD MANUAL (UNIT POINTS) ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Munitorum Field Manual (Unit Points Registry)</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem' }}>
          Define the standard point costs for units. These auto-fill in player rosters when units are selected.
        </p>

        {upMessage && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {upMessage}
          </div>
        )}

        <form onSubmit={handleAddUnitPoint} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Faction</label>
            <select value={newUPFaction} onChange={e => { setNewUPFaction(e.target.value); setNewUPUnit(''); }} required style={{ width: '100%', padding: '0.6rem' }}>
              <option value="">Select Faction...</option>
              {ALLIANCE_ORDER.map(alliance => (
                <optgroup key={alliance} label={`── ${alliance} ──`}>
                  {GROUPED_FACTIONS[alliance].map(f => <option key={f} value={f}>{f}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Unit Name</label>
            <input type="text" placeholder="e.g. Intercessor Squad" list="admin-unit-suggestions" value={newUPUnit}
              onChange={e => setNewUPUnit(e.target.value)} required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
            <datalist id="admin-unit-suggestions">
              {newUPFaction && (UNITS_BY_FACTION[newUPFaction] || []).map(u => <option key={u} value={u} />)}
            </datalist>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginBottom: '4px' }}>Base Pts</label>
            <input type="number" min={0} value={newUPPoints} onChange={e => setNewUPPoints(parseInt(e.target.value) || '')}
              required style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" className="btn primary">Register Points</button>
        </form>

        {fetchingUP ? (
          <p>Syncing Field Manual with Administratum scrolls...</p>
        ) : unitPoints.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No units currently registered in the database.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--theme-border)', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--theme-bg-secondary)', zIndex: 1 }}>
                <tr style={{ borderBottom: '2px solid var(--theme-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Faction</th>
                  <th style={{ padding: '0.75rem' }}>Unit</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Points</th>
                  <th style={{ padding: '0.75rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {unitPoints.map(up => (
                  <tr key={up.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--theme-fg-muted)' }}>{up.faction}</td>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 'bold' }}>{up.unit_name}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{up.base_points}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteUnitPoint(up.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CAMPAIGN VOTES ── */}
      <div className="card">
        <h2>Campaign Voting Tallies</h2>
        {fetchingVotes ? (
          <p>Decrypting anonymous voting ledgers...</p>
        ) : (
          <div>
            <p>Total Votes Securely Logged: {votes.length}</p>
            <ul style={{ marginTop: '1rem', color: 'var(--theme-fg-muted)' }}>
              {votes.map(v => (
                <li key={v.id}>Category [{v.category}] nominated: [{v.profiles?.commander_name || v.nominee_id}]</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
