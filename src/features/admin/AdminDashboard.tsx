import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminDashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  
  const [votes, setVotes] = useState<any[]>([]);
  const [fetchingVotes, setFetchingVotes] = useState(false);

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
    } else {
      alert('Access Denied. Incorrect Phase Code.');
    }
  };

  const fetchVotes = async () => {
    setFetchingVotes(true);
    const { data, error } = await supabase.from('campaign_votes').select('*');
    if (!error && data) {
      setVotes(data);
    }
    setFetchingVotes(false);
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
                <li key={v.id}>Category [{v.category}] nominated: [{v.nominee_id}]</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
