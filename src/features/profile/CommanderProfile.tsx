import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export interface ProfileData {
  id?: string;
  commander_name?: string;
  army_lore?: string;
  avatar_url?: string;
  location?: string;
  army_faction?: string;
  army_subfaction?: string;
  preferred_store_id?: string;
}

export default function CommanderProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [lore, setLore] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [location, setLocation] = useState('');
  const [faction, setFaction] = useState('');
  const [subfaction, setSubfaction] = useState('');
  const [storeId, setStoreId] = useState('');
  const [gameStores, setGameStores] = useState<{id: string, name: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    
    // Auto-Rescue Protocol for Ghost Accounts & Signup Race Conditions
    if (!data) {
      const { data: rescueData, error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        role: user.email === 'omarpatel123@gmail.com' ? 'admin' : 'user',
        commander_name: user.user_metadata?.commander_name || 'Legacy Commander'
      }, { onConflict: 'id' }).select().single();
      
      if (!error && rescueData) {
        data = rescueData;
      }
    }

    if (data) {
      setProfile(data);
      setLore(data.army_lore || '');
      setAvatarUrl(data.avatar_url || '');
      setLocation(data.location || '');
      setFaction(data.army_faction || '');
      setSubfaction(data.army_subfaction || '');
      setStoreId(data.preferred_store_id || '');
    } else {
      setProfile({ id: user.id, commander_name: 'Unregistered' });
      setMessage('Critical failure generating missing profile.');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    supabase.from('game_stores').select('id, name').order('name').then(({ data }) => {
      if (data) setGameStores(data);
    });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !profile) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setMessage('');
    
    // Store image inside a folder tied to their profile UUID
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage('Avatar Error: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    setMessage('Avatar linked successfully.');
  };

  const handleLoreSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setMessage('Scribing lore...');
    const { error } = await supabase.from('profiles').update({ army_lore: lore }).eq('id', profile.id);
    
    if (error) {
      setMessage('Error scribing lore: ' + error.message);
    } else {
      setMessage('Army Chronicles safely archived.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const { error } = await supabase.from('profiles').update({
      location,
      army_faction: faction,
      army_subfaction: subfaction,
      preferred_store_id: storeId || null
    }).eq('id', profile.id);
    
    if (error) {
      setMessage('Failed to lock taxonomy updates.');
    } else {
      setMessage('Commander metadata archived.');
      setEditMode(false);
    }
  };

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Downloading Profile...</div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>
          Commander {profile.commander_name || 'Classified'}
        </h2>
        <button className="btn secondary" onClick={() => setEditMode(!editMode)}>
          {editMode ? 'Cancel Edit' : 'Edit Specs'}
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Avatar Module */}
        <div>
          <div style={{
            width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--theme-bg)', 
            border: '2px dashed var(--theme-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', marginBottom: '1rem'
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--theme-fg-muted)' }}>No Avatar</span>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            style={{ width: '100%', fontSize: '0.8rem' }}
          />
        </div>

        {/* Narrative Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {editMode && (
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--theme-bg-secondary)', padding: '1rem', border: '1px solid var(--theme-border)' }}>
              <h3 style={{ color: 'var(--theme-accent)', margin: 0 }}>Commander Specs</h3>
              <div>
                <label>Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label>Core Faction</label>
                <input type="text" value={faction} onChange={e => setFaction(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label>Subfaction</label>
                <input type="text" value={subfaction} onChange={e => setSubfaction(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label>Game Store</label>
                <select value={storeId} onChange={e => setStoreId(e.target.value)} style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }} required>
                  <option value="" disabled>Select venue...</option>
                  {gameStores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn primary">Lock Specs</button>
            </form>
          )}

          <form onSubmit={handleLoreSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--theme-accent)' }}>Army Chronicles</h3>
              <textarea 
                value={lore}
                onChange={(e) => setLore(e.target.value)}
                placeholder="Detail the narrative of your forces in this sector..."
                style={{ width: '100%', height: '200px', padding: '1rem', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border)', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn primary">Commit Lore to the Archives</button>
          </form>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--theme-border)', color: 'var(--theme-accent)', textAlign: 'center' }}>
          {message}
        </div>
      )}
    </div>
  );
}
