import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { generateMatchups, type MatchPair } from './Matchmaker';

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
    if (!error && data) {
      setVotes(data);
    }
    setFetchingVotes(false);
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
    
    const payload = generatedMatches.map(m => ({
      p1_id: m.p1.id,
      p2_id: m.p2.id,
      status: 'scheduled'
    }));

    const { error } = await supabase.from('matchups').insert(payload);
    if (!error) {
      alert('Matchups actively committed to the Ledger!');
      setGeneratedMatches([]);
    } else {
      alert('Error committing Matchups.');
    }
    setCommittingMatches(false);
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName) return;
    await supabase.from('game_stores').insert({ name: newStoreName, location: newStoreLoc });
    setNewStoreName('');
    setNewStoreLoc('');
    fetchStores();
  };

  const handleDeleteStore = async (storeId: string) => {
    await supabase.from('game_stores').delete().eq('id', storeId);
    fetchStores();
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
            <input 
              id="code" 
              type="password" 
              placeholder="Enter Admin Override Code" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" className="btn primary">Unlock Root Access</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Administration Override Station</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Campaign Voting Tallies</h2>
        {fetchingVotes ? (
          <p>Decrypting anonymous voting ledgers...</p>
        ) : (
          <div>
            <p>Total Votes Securely Logged: {votes.length}</p>
            {/* Extended tally map reduction easily constructed here */}
            <ul style={{ marginTop: '1rem', color: 'var(--theme-fg-muted)' }}>
              {votes.map(v => (
                <li key={v.id}>Category [{v.category}] nominated: [{v.profiles?.commander_name || v.nominee_id}]</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Matchmaking Engine Override</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Automatically pairs commanders globally across their Locations, Experience Tiers, and Army differences.
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
                  <strong>{m.p1.commander_name || 'Unknown'}</strong> ({m.p1.location || 'Unknown loc'}, {m.p1.experience_level}) 
                  <span style={{ color: 'red', margin: '0 0.5rem' }}>VS</span> 
                  <strong>{m.p2.commander_name || 'Unknown'}</strong> ({m.p2.location || 'Unknown loc'}, {m.p2.experience_level}) 
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

      <div className="card">
        <h2>Sanctioned Venue Control (Game Stores)</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Manage global store endpoints where physical operations map via Registration forms.
        </p>

        <form onSubmit={handleAddStore} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Store Name" 
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            required
            style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }}
          />
          <input 
            type="text" 
            placeholder="Location (Optional)" 
            value={newStoreLoc}
            onChange={(e) => setNewStoreLoc(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }}
          />
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
              <button 
                onClick={() => handleDeleteStore(store.id)}
                style={{ backgroundColor: 'transparent', color: 'red', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
