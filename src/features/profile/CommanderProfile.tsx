import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function CommanderProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [lore, setLore] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setProfile(data);
      setLore(data.army_lore || '');
      setAvatarUrl(data.avatar_url || '');
    } else {
      setProfile({ commander_name: 'Unregistered' });
      setMessage('Profile missing from PostgreSQL ledger. You may need to create a new test account.');
    }
  };

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

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Downloading Profile...</div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem' }}>
        Commander {profile.commander_name || 'Classified'}
      </h2>
      
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

      {message && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--theme-border)', color: 'var(--theme-accent)', textAlign: 'center' }}>
          {message}
        </div>
      )}
    </div>
  );
}
