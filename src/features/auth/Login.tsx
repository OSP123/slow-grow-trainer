import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function Login() {
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signInWithPassword({ email, password });
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (!error) {
      setMessage('Recovery link transmitted. Check your comms (email).');
    } else {
      setMessage('Error transmitting to that address.');
    }
  };

  if (view === 'forgot') {
    return (
      <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Identity Recovery</h2>
        <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" className="btn primary" style={{ marginTop: '1rem' }}>
            Send Recovery Link
          </button>
          
          {message && <div style={{ color: 'var(--theme-accent)', marginTop: '1rem', textAlign: 'center' }}>{message}</div>}

          <div 
            onClick={() => setView('login')} 
            style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Return to Logistics Portal
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Secure Access</h2>
      <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label htmlFor="password">Security Code</label>
          <input 
            id="password" 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" className="btn primary" style={{ marginTop: '1rem' }}>
          Engage
        </button>

        <div 
          onClick={() => setView('forgot')} 
          style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Forgot Password?
        </div>
      </form>
    </div>
  );
}
