import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export interface GameStore {
  id: string;
  name: string;
}

export default function Login() {
  const [view, setView] = useState<'login' | 'forgot' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [cmdName, setCmdName] = useState('');
  const [discord, setDiscord] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('beginner');
  const [faction, setFaction] = useState('');
  const [subfaction, setSubfaction] = useState('');
  const [storeId, setStoreId] = useState('');
  const [gameStores, setGameStores] = useState<GameStore[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.from('game_stores').select('id, name').order('name').then(({ data }) => {
      if (data) setGameStores(data);
    });
  }, []);

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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          real_name: realName,
          commander_name: cmdName,
          discord_name: discord,
          location: location,
          experience_level: experience,
          army_faction: faction,
          army_subfaction: subfaction,
          preferred_store_id: storeId
        }
      }
    });
    if (error) {
      setMessage('Failed to register: ' + error.message);
    } else {
      setMessage('Registration logged! Verify your email to complete clearance.');
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

  if (view === 'signup') {
    return (
      <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>New Commander Registration</h2>
        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <div>
            <label htmlFor="realName">Real Name</label>
            <input 
              id="realName" 
              type="text" 
              placeholder="Real Name" 
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="cmdName">Commander Name</label>
            <input 
              id="cmdName" 
              type="text" 
              placeholder="Commander Name" 
              value={cmdName}
              onChange={(e) => setCmdName(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="discord">Discord Handle</label>
            <input 
              id="discord" 
              type="text" 
              placeholder="Discord Handle" 
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="location">Geographical Zone (City/Zip)</label>
            <input 
              id="location" 
              type="text" 
              placeholder="Your Location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="experience">Commander Experience</label>
            <select 
              id="experience" 
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
            >
              <option value="beginner">Recruit (Beginner)</option>
              <option value="intermediate">Veteran (Intermediate)</option>
              <option value="experienced">Warmaster (Experienced)</option>
            </select>
          </div>
          <div>
            <label htmlFor="faction">Army Core Faction</label>
            <input 
              id="faction" 
              type="text" 
              placeholder="e.g. Space Marines, Chaos..." 
              value={faction}
              onChange={(e) => setFaction(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="subfaction">Army Subfaction</label>
            <input 
              id="subfaction" 
              type="text" 
              placeholder="e.g. Blood Angels, World Eaters..." 
              value={subfaction}
              onChange={(e) => setSubfaction(e.target.value)}
              required
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="store">Preferred Game Store</label>
            <select 
              id="store" 
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
            >
              <option value="" disabled>Select your local operational venue...</option>
              {gameStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            {gameStores.length === 0 && <span style={{ color: 'var(--theme-accent)', fontSize: '0.8rem' }}>No venues registered globally. Registration locked.</span>}
          </div>
          <button type="submit" className="btn primary" style={{ marginTop: '1rem' }}>
            Register
          </button>
          
          {message && <div style={{ color: 'var(--theme-accent)', marginTop: '1rem', textAlign: 'center' }}>{message}</div>}

          <div 
            onClick={() => setView('login')} 
            style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cancel Registration
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
          Deploy
        </button>

        <div 
          onClick={() => setView('forgot')} 
          style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Forgot Password?
        </div>
        <div 
          onClick={() => setView('signup')} 
          style={{ textAlign: 'center', marginTop: '0.25rem', color: 'var(--theme-accent)', cursor: 'pointer', fontSize: '0.9rem' }}
        >
          Create an Account
        </div>
      </form>
    </div>
  );
}
