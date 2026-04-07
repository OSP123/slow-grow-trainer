import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function UpdatePassword({ setIsRecovering }: { setIsRecovering: (val: boolean) => void }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage('Failed to re-encode identity. ' + error.message);
      setUpdating(false);
    } else {
      setMessage('Security Code updated successfully.');
      setTimeout(() => {
        setIsRecovering(false); // Return to standard routing
      }, 2000);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Establish New Identity</h2>
      <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
        You have securely bypassed the authorization gate. Input your new security code below.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="new-password">New Security Code</label>
          <input 
            id="new-password" 
            type="password" 
            placeholder="New Security Code" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" className="btn primary" style={{ marginTop: '1rem' }} disabled={updating || !password}>
          {updating ? 'Establishing...' : 'Establish New Code'}
        </button>

        {message && <div style={{ color: 'var(--theme-accent)', marginTop: '1rem', textAlign: 'center' }}>{message}</div>}
      </form>
    </div>
  );
}
