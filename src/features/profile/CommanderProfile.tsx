import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { compressImage, getTransformUrl } from '../../utils/imageCompression';
import ArmyRoster from './ArmyRoster';
import { useUnitRegistry } from '../../hooks/useUnitRegistry';
import { useCommanderCampaignData } from '../../hooks/useCommanderCampaignData';

export interface ProfileData {
  id?: string;
  commander_name?: string;
  army_lore?: string;
  avatar_url?: string;
  location?: string;
  army_faction?: string;
  army_subfaction?: string;
  preferred_store_id?: string;
  warlord_name?: string;
  warlord_traits?: string[];
}

type Tab = 'specs' | 'roster' | 'lore' | 'warlord';

export default function CommanderProfile() {
  const { profileId } = useParams<{ profileId?: string }>();
  const { unitsByFaction } = useUnitRegistry();
  const { badges, warlordXp } = useCommanderCampaignData(profileId);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [lore, setLore] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [location, setLocation] = useState('');
  const [faction, setFaction] = useState('');
  const [subfaction, setSubfaction] = useState('');
  const [storeId, setStoreId] = useState('');
  const [gameStores, setGameStores] = useState<{ id: string, name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('specs');
  const [factionImages, setFactionImages] = useState<string[]>([]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);

    const targetId = profileId || user?.id;
    if (!targetId) return;

    let { data } = await supabase.from('profiles').select('*').eq('id', targetId).maybeSingle();

    // Auto-Rescue Protocol — only for own profile
    if (!data && !profileId && user) {
      const { data: rescueData, error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        role: user.email === 'omarpatel123@gmail.com' ? 'admin' : 'user',
        commander_name: user.user_metadata?.commander_name || 'Legacy Commander'
      }, { onConflict: 'id' }).select().single();
      if (!error && rescueData) data = rescueData;
    }

    if (data) {
      setProfile(data);
      setLore(data.army_lore || '');
      setAvatarUrl(data.avatar_url || '');
      setLocation(data.location || '');
      setFaction(data.army_faction || '');
      setSubfaction(data.army_subfaction || '');
      setStoreId(data.preferred_store_id || '');

      if (data.army_faction) {
        const { data: unitData } = await supabase.from('army_units').select('image_url').eq('faction', data.army_faction).not('image_url', 'is', null).order('created_at', { ascending: false }).limit(50);
        if (unitData) setFactionImages(unitData.map(u => u.image_url!));
      }
    } else {
      setProfile({ id: targetId, commander_name: 'Unregistered' });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    supabase.from('game_stores').select('id, name').order('name').then(({ data }) => {
      if (data) setGameStores(data);
    });
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOwner = !profileId || (currentUserId !== null && currentUserId === profile?.id);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !profile) return;
    const rawFile = e.target.files[0];

    setUploading(true);
    setMessage('Compressing image...');

    const { file, error: compressError } = await compressImage(rawFile, 1200, 0.82);
    if (compressError) {
      setMessage(compressError);
      setUploading(false);
      return;
    }

    setMessage('Uploading...');
    const fileExt = 'jpg'; // compressImage always outputs JPEG
    const filePath = `${profile.id}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) { setMessage('Avatar Error: ' + uploadError.message); setUploading(false); return; }
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
    if (error) setMessage('Error scribing lore: ' + error.message);
    else setMessage('Army Chronicles safely archived.');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const { error } = await supabase.from('profiles').update({
      location, army_faction: faction, army_subfaction: subfaction,
      preferred_store_id: storeId || null
    }).eq('id', profile.id);
    if (error) setMessage('Failed to lock taxonomy updates.');
    else { setMessage('Commander metadata archived.'); setEditMode(false); }
  };

  if (!profile) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Downloading Profile...</div>;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'specs', label: 'Commander Specs' },
    { key: 'roster', label: 'Army Roster' },
    { key: 'warlord', label: 'Warlord Headquarters' },
    { key: 'lore', label: 'Army Chronicles' },
  ];

  return (
    <>
      {factionImages.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: -1,
          opacity: 0.1,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          {factionImages.map((src, i) => (
            <img key={i} src={src} alt="" style={{ width: '250px', height: '250px', objectFit: 'cover' }} />
          ))}
          {/* Fill extra space by repeating */}
          {[...Array(20)].map((_, i) => (
            <img key={`repeat-${i}`} src={factionImages[i % factionImages.length]} alt="" style={{ width: '250px', height: '250px', objectFit: 'cover' }} />
          ))}
        </div>
      )}
      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{
          width: '80px', height: '80px', flexShrink: 0,
          border: '2px solid var(--theme-border)', borderRadius: '50%', overflow: 'hidden',
          backgroundColor: 'var(--theme-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {avatarUrl
            ? <img src={getTransformUrl(avatarUrl, 160, 80)} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '2rem' }}>⚔</span>}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>
            Commander {profile.commander_name || 'Classified'}
            {profileId && !isOwner && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.7rem', color: 'var(--theme-fg-muted)', fontWeight: 'normal', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Viewing Profile
              </span>
            )}
          </h2>
          {profile.army_faction && (
            <div style={{ fontSize: '0.9rem', color: 'var(--theme-accent)' }}>
              {profile.army_faction}{profile.army_subfaction ? ` — ${profile.army_subfaction}` : ''}
            </div>
          )}
          {profile.location && <div style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>📍 {profile.location}</div>}
          
          {/* Badges Display */}
          {badges.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {badges.map(b => (
                <div key={b.id} title={b.description} style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  padding: '4px 8px', borderRadius: '12px', 
                  backgroundColor: 'var(--theme-bg-secondary)', 
                  border: `1px solid ${b.color}`,
                  fontSize: '0.75rem', cursor: 'help'
                }}>
                  <span>{b.icon}</span>
                  <span style={{ color: b.color, fontWeight: 'bold' }}>{b.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {isOwner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Change Avatar'}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--theme-border)', marginBottom: '1.5rem', gap: '0' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setMessage(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.75rem 1.5rem', fontSize: '0.9rem',
              color: activeTab === tab.key ? 'var(--theme-accent)' : 'var(--theme-fg-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--theme-accent)' : '2px solid transparent',
              marginBottom: '-2px', fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="card">
        {/* ── SPECS TAB ── */}
        {activeTab === 'specs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--theme-accent)' }}>Commander Specifications</h3>
              {isOwner && (
                <button className="btn secondary" onClick={() => setEditMode(!editMode)}>
                  {editMode ? 'Cancel' : 'Edit Specs'}
                </button>
              )}
            </div>

            {isOwner && editMode ? (
              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Core Faction</label>
                    <select value={faction} onChange={e => setFaction(e.target.value)} style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border)' }} required>
                      <option value="">Select Faction...</option>
                      {Object.keys(unitsByFaction).sort().map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Subfaction</label>
                    <input type="text" value={subfaction} onChange={e => setSubfaction(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>Sanctioned Venue</label>
                    <select value={storeId} onChange={e => setStoreId(e.target.value)} style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}>
                      <option value="">Select venue...</option>
                      {gameStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn primary" style={{ alignSelf: 'flex-start' }}>Lock Specs</button>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Location', value: profile.location },
                  { label: 'Core Faction', value: profile.army_faction },
                  { label: 'Subfaction', value: profile.army_subfaction },
                  { label: 'Preferred Venue', value: gameStores.find(s => s.id === profile.preferred_store_id)?.name },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontWeight: 'bold' }}>{value || <span style={{ color: 'var(--theme-fg-muted)', fontWeight: 'normal' }}>Not set</span>}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ROSTER TAB ── */}
        {activeTab === 'roster' && profile.id && (
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--theme-accent)' }}>
              {isOwner ? 'My Army Roster' : `${profile.commander_name}'s Army Roster`}
            </h3>
            <ArmyRoster profileId={profile.id} isOwner={isOwner} />
          </div>
        )}

        {/* ── LORE TAB ── */}
        {activeTab === 'lore' && (
          <div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--theme-accent)' }}>Army Chronicles</h3>
            {isOwner ? (
              <form onSubmit={handleLoreSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea
                  value={lore} onChange={e => setLore(e.target.value)}
                  placeholder="Detail the narrative of your forces in this sector..."
                  style={{ width: '100%', height: '250px', padding: '1rem', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border)', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <button type="submit" className="btn primary" style={{ alignSelf: 'flex-start' }}>Commit to Archives</button>
              </form>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)', minHeight: '150px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {profile.army_lore || <span style={{ color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>No chronicles scribed yet.</span>}
              </div>
            )}
          </div>
        )}

        {/* ── WARLORD TAB ── */}
        {activeTab === 'warlord' && profile.id && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--theme-accent)' }}>Crucible of Champions</h3>
            </div>
            
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)', borderRadius: '6px' }}>
              {isOwner ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setMessage('Updating Warlord...');
                  try {
                    const { error } = await supabase.from('profiles').update({ warlord_name: profile.warlord_name }).eq('id', profile.id);
                    if (error) setMessage('Error: ' + error.message);
                    else setMessage('Warlord updated successfully.');
                  } catch (err: any) {
                    setMessage('Database schema update pending for Warlord features.');
                  }
                }} style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)' }}>Warlord Name</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                      type="text" 
                      value={profile.warlord_name || ''} 
                      onChange={e => setProfile({...profile, warlord_name: e.target.value})}
                      placeholder="e.g. Captain Titus"
                      style={{ flex: 1, padding: '0.75rem', boxSizing: 'border-box' }}
                    />
                    <button type="submit" className="btn primary">Save Name</button>
                  </div>
                </form>
              ) : (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-fg-muted)' }}>Commanding Officer</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{profile.warlord_name || 'Unknown Commander'}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--theme-accent)', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>Combat Experience</h4>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{Math.floor(warlordXp / 50) + 1} <span style={{ fontSize: '1rem', color: 'var(--theme-fg-muted)', fontWeight: 'normal' }}>Level</span></div>
                  <div style={{ color: 'var(--theme-fg-muted)' }}>{warlordXp} Total VP Scored</div>
                  <div style={{ marginTop: '1rem', height: '6px', backgroundColor: 'var(--theme-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(warlordXp % 50) * 2}%`, backgroundColor: 'var(--theme-accent)', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                    {50 - (warlordXp % 50)} VP to next level
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: 'var(--theme-accent)', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>Battle Traits & Scars</h4>
                  {profile.warlord_traits && profile.warlord_traits.length > 0 ? (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {profile.warlord_traits.map((trait, i) => (
                        <li key={i} style={{ padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderLeft: '2px solid var(--theme-accent)' }}>
                          {trait}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>No traits or scars acquired yet.</div>
                  )}
                  {isOwner && Math.floor(warlordXp / 50) + 1 > (profile.warlord_traits?.length || 0) + 1 && (
                     <div style={{ marginTop: '1rem' }}>
                       <button onClick={async () => {
                         try {
                           const traits = [...(profile.warlord_traits || []), 'Hardened Veteran'];
                           setProfile({...profile, warlord_traits: traits});
                           await supabase.from('profiles').update({ warlord_traits: traits }).eq('id', profile.id);
                         } catch (err: any) {
                           setMessage('Database schema update pending.');
                         }
                       }} className="btn secondary" style={{ width: '100%' }}>Acquire New Trait</button>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', border: '1px solid var(--theme-border)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
            {message}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
