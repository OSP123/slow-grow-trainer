import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { SUBFACTIONS_MAP } from '../../data/warhammer40k';
import { useUnitRegistry } from '../../hooks/useUnitRegistry';
import { playClickSound, playHoverSound, isSoundEnabled, setSoundEnabled } from '../../utils/audioEffects';

export interface GameStore {
  id: string;
  name: string;
}

export default function Login() {
  const { unitsByFaction } = useUnitRegistry();
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
  const [isSubfactionCustom, setIsSubfactionCustom] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [gameStores, setGameStores] = useState<GameStore[]>([]);
  const [message, setMessage] = useState('');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  useEffect(() => {
    supabase.from('game_stores').select('id, name').order('name').then(({ data }) => {
      if (data) setGameStores(data);
    });
  }, []);

  const toggleSound = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
    setSoundEnabled(newVal);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    }
  };

  const handleCoreFactionChange = (val: string) => {
    setFaction(val);
    setSubfaction('');
    setIsSubfactionCustom(false);
  };

  const handleSubfactionChange = (val: string) => {
    if (val === 'CUSTOM_OTHER') {
      setIsSubfactionCustom(true);
      setSubfaction('');
    } else {
      setIsSubfactionCustom(false);
      setSubfaction(val);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (!error) {
      setMessage('Recovery link transmitted. Check your comms (email).');
    } else {
      setMessage('Error transmitting to that address.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setMessage('');
    if (password.length < 8 || !/\d/.test(password)) {
      setMessage('Password must be at least 8 characters long and contain at least one number.');
      return;
    }
    const { error } = await supabase.auth.signUp({  
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin,
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

  const soundToggleButton = (
    <button
      onClick={toggleSound}
      title={soundOn ? 'Mute sounds' : 'Enable sounds'}
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid var(--theme-border)',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.2rem',
        color: soundOn ? 'var(--theme-accent)' : 'var(--theme-fg-muted)',
        zIndex: 10000,
        transition: 'color 0.2s ease',
      }}
    >
      {soundOn ? '🔊' : '🔇'}
    </button>
  );

  if (view === 'forgot') {
    return (
      <div className="scanline-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card dataslate" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', boxSizing: 'border-box', width: '100%' }}>
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
              onMouseEnter={() => playHoverSound()}
              style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Return to Logistics Portal
            </div>
          </form>
        </div>
        {soundToggleButton}
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="scanline-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card dataslate" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', boxSizing: 'border-box', width: '100%' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>New Commander Registration</h2>
          <div className="caution-banner">
            ⚠ WARNING: UNAUTHORIZED ACCESS PUNISHABLE BY SERVITORIZATION ⚠
          </div>
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
              <select
                id="faction"
                value={faction}
                onChange={(e) => handleCoreFactionChange(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
              >
                <option value="" disabled>Select Core Faction...</option>
                {Object.keys(unitsByFaction).sort().map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subfaction">Army Subfaction</label>
              {!isSubfactionCustom ? (
                <select
                  id="subfaction"
                  value={subfaction}
                  onChange={(e) => handleSubfactionChange(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
                  disabled={!faction}
                >
                  <option value="" disabled>{faction ? 'Select Subfaction...' : 'Select Core Faction first'}</option>
                  {faction && (SUBFACTIONS_MAP[faction] || []).map(sf => (
                    <option key={sf} value={sf}>{sf}</option>
                  ))}
                  <option value="CUSTOM_OTHER">Custom / Other...</option>
                </select>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    id="subfaction"
                    type="text"
                    placeholder="Enter custom chapter/fleet name..."
                    value={subfaction}
                    onChange={(e) => setSubfaction(e.target.value)}
                    required
                    autoFocus
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                  <span 
                    onClick={() => setIsSubfactionCustom(false)} 
                    style={{ fontSize: '0.75rem', color: 'var(--theme-accent)', cursor: 'pointer', textAlign: 'right' }}
                  >
                    Return to dropdown
                  </span>
                </div>
              )}
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
              onMouseEnter={() => playHoverSound()}
              style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel Registration
            </div>
          </form>
        </div>
        {soundToggleButton}
      </div>
    );
  }

  return (
    <div className="scanline-overlay" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card dataslate" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem', boxSizing: 'border-box', width: '100%' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Secure Access</h2>
        {message && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}
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
            onMouseEnter={() => playHoverSound()}
            style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--theme-fg-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Forgot Password?
          </div>
          <div 
            onClick={() => setView('signup')} 
            onMouseEnter={() => playHoverSound()}
            style={{ textAlign: 'center', marginTop: '0.25rem', color: 'var(--theme-accent)', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Create an Account
          </div>
        </form>
      </div>
      {soundToggleButton}
    </div>
  );
}
