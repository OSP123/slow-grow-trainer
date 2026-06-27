import React from 'react';
import type { ProfileData, CrucibleRangedWeapon, CrucibleMeleeWeapon, CrucibleDatasheet } from './CommanderProfile';

interface Props {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  datasheetIndex: number;
  onRemove: () => void;
}

export default function DatasheetBuilder({ profile, setProfile, datasheetIndex, onRemove }: Props) {
  const ds = profile.crucible_datasheets?.[datasheetIndex] || {} as CrucibleDatasheet;

  const updateDatasheet = (updater: (prev: CrucibleDatasheet) => CrucibleDatasheet) => {
    setProfile(p => {
      if (!p) return p;
      const sheets = [...(p.crucible_datasheets || [])];
      // Ensure the array has enough elements
      while (sheets.length <= datasheetIndex) {
        sheets.push({ id: Math.random().toString(36).substr(2, 9), name: '' });
      }
      sheets[datasheetIndex] = updater(sheets[datasheetIndex]);
      return { ...p, crucible_datasheets: sheets };
    });
  };

  const updateStats = (field: string, value: string) => {
    updateDatasheet(d => ({
      ...d,
      stats: { ...(d.stats || { m: '', t: '', sv: '', invuln: '', w: '', ld: '', oc: '' }), [field]: value }
    }));
  };

  const addRangedWeapon = () => {
    updateDatasheet(d => ({
      ...d,
      rangedWeapons: [
        ...(d.rangedWeapons || []),
        { id: Math.random().toString(36).substr(2, 9), name: '', range: '', a: '', bs: '', s: '', ap: '', d: '', keywords: '' }
      ]
    }));
  };

  const updateRangedWeapon = (id: string, field: string, value: string) => {
    updateDatasheet(d => ({
      ...d,
      rangedWeapons: (d.rangedWeapons || []).map((w: CrucibleRangedWeapon) => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  const removeRangedWeapon = (id: string) => {
    updateDatasheet(d => ({
      ...d,
      rangedWeapons: (d.rangedWeapons || []).filter((w: CrucibleRangedWeapon) => w.id !== id)
    }));
  };

  const addMeleeWeapon = () => {
    updateDatasheet(d => ({
      ...d,
      meleeWeapons: [
        ...(d.meleeWeapons || []),
        { id: Math.random().toString(36).substr(2, 9), name: '', range: 'Melee', a: '', ws: '', s: '', ap: '', d: '', keywords: '' }
      ]
    }));
  };

  const updateMeleeWeapon = (id: string, field: string, value: string) => {
    updateDatasheet(d => ({
      ...d,
      meleeWeapons: (d.meleeWeapons || []).map((w: CrucibleMeleeWeapon) => w.id === id ? { ...w, [field]: value } : w)
    }));
  };

  const removeMeleeWeapon = (id: string) => {
    updateDatasheet(d => ({
      ...d,
      meleeWeapons: (d.meleeWeapons || []).filter((w: CrucibleMeleeWeapon) => w.id !== id)
    }));
  };

  return (
    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--theme-border)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--theme-accent)' }}>Edit Champion {datasheetIndex + 1}</h4>
        <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.9rem' }}>Remove Champion</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Warlord Name</label>
          <input 
            type="text" 
            value={ds.name || ''} 
            onChange={e => updateDatasheet(d => ({ ...d, name: e.target.value }))}
            placeholder="e.g. Captain Titus"
            style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Points</label>
          <input 
            type="number" 
            value={ds.points || ''} 
            onChange={e => updateDatasheet(d => ({ ...d, points: e.target.value ? parseInt(e.target.value) : undefined }))}
            placeholder="pts"
            style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', textAlign: 'center' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Archetype</label>
          <input 
            type="text" 
            value={ds.archetype || ''} 
            onChange={e => updateDatasheet(d => ({ ...d, archetype: e.target.value }))}
            placeholder="e.g. Librarius Adept"
            style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Specialism</label>
          <input 
            type="text" 
            value={ds.specialism || ''} 
            onChange={e => updateDatasheet(d => ({ ...d, specialism: e.target.value }))}
            placeholder="e.g. Conversion Field"
            style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Core Stats</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {['m', 't', 'sv', 'invuln', 'w', 'ld', 'oc'].map(stat => (
            <div key={stat}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.25rem', color: 'var(--theme-fg-muted)' }}>{stat}</div>
              <input 
                type="text" 
                value={(ds.stats as any)?.[stat] || ''} 
                onChange={e => updateStats(stat, e.target.value)}
                placeholder="-"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', textAlign: 'center' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Ranged Weapons</label>
          <button type="button" onClick={addRangedWeapon} className="btn secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>+ Add Ranged</button>
        </div>
        {(ds.rangedWeapons || []).map((w) => (
          <div key={w.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '4px', marginBottom: '0.5rem', borderLeft: '3px solid var(--theme-accent)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Weapon Name" value={w.name} onChange={e => updateRangedWeapon(w.id, 'name', e.target.value)} style={{ flex: 1, padding: '0.5rem' }} />
              <button type="button" onClick={() => removeRangedWeapon(w.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', minWidth: '350px' }}>
                <input type="text" placeholder="Range" value={w.range} onChange={e => updateRangedWeapon(w.id, 'range', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Range" />
                <input type="text" placeholder="A" value={w.a} onChange={e => updateRangedWeapon(w.id, 'a', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Attacks" />
                <input type="text" placeholder="BS" value={w.bs} onChange={e => updateRangedWeapon(w.id, 'bs', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Ballistic Skill" />
                <input type="text" placeholder="S" value={w.s} onChange={e => updateRangedWeapon(w.id, 's', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Strength" />
                <input type="text" placeholder="AP" value={w.ap} onChange={e => updateRangedWeapon(w.id, 'ap', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Armor Penetration" />
                <input type="text" placeholder="D" value={w.d} onChange={e => updateRangedWeapon(w.id, 'd', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Damage" />
              </div>
            </div>
            <input type="text" placeholder="Keywords (e.g. Assault, Heavy)" value={w.keywords} onChange={e => updateRangedWeapon(w.id, 'keywords', e.target.value)} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Melee Weapons</label>
          <button type="button" onClick={addMeleeWeapon} className="btn secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>+ Add Melee</button>
        </div>
        {(ds.meleeWeapons || []).map((w) => (
          <div key={w.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '4px', marginBottom: '0.5rem', borderLeft: '3px solid var(--theme-accent)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Weapon Name" value={w.name} onChange={e => updateMeleeWeapon(w.id, 'name', e.target.value)} style={{ flex: 1, padding: '0.5rem' }} />
              <button type="button" onClick={() => removeMeleeWeapon(w.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', minWidth: '350px' }}>
                <input type="text" placeholder="Range" value={w.range} onChange={e => updateMeleeWeapon(w.id, 'range', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Range" disabled />
                <input type="text" placeholder="A" value={w.a} onChange={e => updateMeleeWeapon(w.id, 'a', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Attacks" />
                <input type="text" placeholder="WS" value={w.ws} onChange={e => updateMeleeWeapon(w.id, 'ws', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Weapon Skill" />
                <input type="text" placeholder="S" value={w.s} onChange={e => updateMeleeWeapon(w.id, 's', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Strength" />
                <input type="text" placeholder="AP" value={w.ap} onChange={e => updateMeleeWeapon(w.id, 'ap', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Armor Penetration" />
                <input type="text" placeholder="D" value={w.d} onChange={e => updateMeleeWeapon(w.id, 'd', e.target.value)} style={{ padding: '0.5rem', textAlign: 'center' }} title="Damage" />
              </div>
            </div>
            <input type="text" placeholder="Keywords (e.g. Devastating Wounds)" value={w.keywords} onChange={e => updateMeleeWeapon(w.id, 'keywords', e.target.value)} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Abilities / Rules</label>
        <textarea 
          value={ds.abilities || ''} 
          onChange={e => updateDatasheet(d => ({ ...d, abilities: e.target.value }))}
          placeholder="e.g. Leader, Deep Strike, Fights First..."
          style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)', fontWeight: 'bold' }}>Unit Keywords</label>
        <input 
          type="text" 
          value={ds.keywords || ''} 
          onChange={e => updateDatasheet(d => ({ ...d, keywords: e.target.value }))}
          placeholder="e.g. INFANTRY, CHARACTER, IMPERIUM, ADEPTUS ASTARTES"
          style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}
