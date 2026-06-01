import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FACTIONS, UNITS_BY_FACTION, getFactionsGrouped } from '../../data/warhammer40k';

interface ArmyUnit {
  id: string;
  unit_name: string;
  faction: string | null;
  model_count: number;
  points: number | null;
  built: boolean;
  painted: boolean;
  played: boolean;
  notes: string | null;
  image_url: string | null;
}

interface Props {
  profileId: string;
  isOwner: boolean;
}

function ProgressBar({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
        <span style={{ color: 'var(--theme-fg-muted)' }}>{label}</span>
        <span style={{ color: 'var(--theme-accent)' }}>{done}/{total}</span>
      </div>
      <div style={{ height: '6px', backgroundColor: 'var(--theme-bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--theme-accent)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

const GROUPED_FACTIONS = getFactionsGrouped();
const ALLIANCE_ORDER: ('Imperium' | 'Chaos' | 'Xenos')[] = ['Imperium', 'Chaos', 'Xenos'];

export default function ArmyRoster({ profileId, isOwner }: Props) {
  const [units, setUnits] = useState<ArmyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingUnitId, setUploadingUnitId] = useState<string | null>(null);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  // Add unit form
  const [selectedFaction, setSelectedFaction] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [modelCount, setModelCount] = useState<number>(1);
  const [points, setPoints] = useState<number | ''>('');
  const [pointsLookedUp, setPointsLookedUp] = useState(false); // true if auto-filled from DB
  const [notes, setNotes] = useState('');
  const [addingUnit, setAddingUnit] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const fetchRoster = async () => {
    const { data } = await supabase
      .from('army_units')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    if (data) setUnits(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoster();
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unit list for the selected faction, filtered by search
  const availableUnits: string[] = selectedFaction
    ? (UNITS_BY_FACTION[selectedFaction] ?? []).filter(u =>
        u.toLowerCase().includes(unitSearch.toLowerCase())
      )
    : [];

  const handleFactionChange = (f: string) => {
    setSelectedFaction(f);
    setSelectedUnit('');
    setUnitSearch('');
    setPoints('');
    setPointsLookedUp(false);
  };

  const lookupUnitPoints = async (unitName: string, faction: string) => {
    if (!unitName || !faction) return;
    const { data } = await supabase
      .from('unit_points')
      .select('base_points')
      .eq('faction', faction)
      .eq('unit_name', unitName)
      .maybeSingle();
    if (data?.base_points != null) {
      setPoints(data.base_points);
      setPointsLookedUp(true);
    } else {
      // No registry entry — clear auto-fill but don't overwrite manual input
      setPointsLookedUp(false);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow free-text entry if nothing from the list was selected
    const name = selectedUnit || unitSearch.trim();
    if (!name) { setFormMessage('Enter or select a unit name.'); return; }

    setAddingUnit(true);
    setFormMessage('');

    if (editingUnitId) {
      const { error } = await supabase.from('army_units').update({
        unit_name: name,
        faction: selectedFaction || null,
        model_count: modelCount,
        points: points !== '' ? points : null,
        notes: notes || null,
      }).eq('id', editingUnitId);

      if (error) {
        setFormMessage('Error: ' + error.message);
      } else {
        setUnits(prev => prev.map(u => u.id === editingUnitId ? {
          ...u,
          unit_name: name,
          faction: selectedFaction || null,
          model_count: modelCount,
          points: points !== '' ? Number(points) : null,
          notes: notes || null,
        } : u));
        resetForm();
        setFormMessage('Unit updated successfully.');
      }
    } else {
      const { error } = await supabase.from('army_units').insert({
        profile_id: profileId,
        unit_name: name,
        faction: selectedFaction || null,
        model_count: modelCount,
        points: points !== '' ? points : null,
        notes: notes || null,
        built: false,
        painted: false,
        played: false,
      });
      if (error) {
        setFormMessage('Error: ' + error.message);
      } else {
        resetForm();
        setFormMessage('Unit mustered to roster.');
        fetchRoster();
      }
    }
    setAddingUnit(false);
  };

  const resetForm = () => {
    setSelectedUnit('');
    setUnitSearch('');
    setModelCount(1);
    setPoints('');
    setPointsLookedUp(false);
    setNotes('');
    setEditingUnitId(null);
  };

  const handleEditUnit = (unit: ArmyUnit) => {
    setEditingUnitId(unit.id);
    setSelectedFaction(unit.faction || '');
    setUnitSearch(unit.unit_name);
    setSelectedUnit(unit.unit_name);
    setModelCount(unit.model_count);
    setPoints(unit.points ?? '');
    setPointsLookedUp(false);
    setNotes(unit.notes || '');
    setFormMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleField = async (unit: ArmyUnit, field: 'built' | 'painted' | 'played') => {
    const newVal = !unit[field];
    const { error } = await supabase.from('army_units').update({ [field]: newVal }).eq('id', unit.id);
    if (!error) {
      setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, [field]: newVal } : u));
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    await supabase.from('army_units').delete().eq('id', unitId);
    setUnits(prev => prev.filter(u => u.id !== unitId));
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>, unit: ArmyUnit) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingUnitId(unit.id);

    const fileExt = file.name.split('.').pop();
    const filePath = `${profileId}/${unit.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('unit_photos').upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Error uploading photo: ' + uploadError.message);
      setUploadingUnitId(null);
      return;
    }

    const { data: publicData } = supabase.storage.from('unit_photos').getPublicUrl(filePath);

    const { error: updateError } = await supabase.from('army_units').update({ image_url: publicData.publicUrl }).eq('id', unit.id);

    if (!updateError) {
      setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, image_url: publicData.publicUrl } : u));
    } else {
      alert('Failed to save image URL to unit.');
    }
    setUploadingUnitId(null);
  };

  const total = units.length;
  const builtCount = units.filter(u => u.built).length;
  const paintedCount = units.filter(u => u.painted).length;
  const playedCount = units.filter(u => u.played).length;

  // Alliance colour coding for faction badge
  const factionAlliance = (name: string) =>
    FACTIONS.find(f => f.name === name)?.grandAlliance;

  const allianceColour: Record<string, string> = {
    Imperium: '#3b82f6',
    Chaos: '#ef4444',
    Xenos: '#a855f7',
  };

  if (loading) return <div style={{ color: 'var(--theme-fg-muted)', padding: '1rem' }}>Loading roster...</div>;

  return (
    <div>
      {/* Progress Summary */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--theme-bg-secondary)', borderRadius: '6px', border: '1px solid var(--theme-border)' }}>
          <ProgressBar label="⚙ Built" done={builtCount} total={total} />
          <ProgressBar label="🎨 Painted" done={paintedCount} total={total} />
          <ProgressBar label="⚔ Played" done={playedCount} total={total} />
        </div>
      )}

      {/* Add unit form — owner only */}
      {isOwner && (
        <div style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid var(--theme-border)', borderRadius: '6px', backgroundColor: 'var(--theme-bg-secondary)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--theme-accent)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {editingUnitId ? 'Edit Unit' : 'Muster Unit'}
          </h3>
          <form onSubmit={handleAddUnit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Row 1: Faction + Unit search */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Faction</label>
                <select
                  value={selectedFaction}
                  onChange={e => handleFactionChange(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                >
                  <option value="">Select faction...</option>
                  {ALLIANCE_ORDER.map(alliance => (
                    <optgroup key={alliance} label={`── ${alliance} ──`}>
                      {GROUPED_FACTIONS[alliance].map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>
                  Unit {!selectedFaction && <span style={{ color: 'var(--theme-fg-muted)' }}>(select faction first, or type freely)</span>}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={selectedUnit || unitSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setUnitSearch(val);
                      setSelectedUnit('');
                      setPointsLookedUp(false);
                      // If the typed value exactly matches a known unit, auto-lookup
                      if (selectedFaction && UNITS_BY_FACTION[selectedFaction]?.includes(val)) {
                        lookupUnitPoints(val, selectedFaction);
                      }
                    }}
                    placeholder={selectedFaction ? 'Search or type unit name...' : 'Type unit name...'}
                    style={{ width: '100%', padding: '0.6rem', paddingRight: '2rem', boxSizing: 'border-box' }}
                    list="unit-suggestions"
                  />
                  {(selectedUnit || unitSearch) && (
                    <button
                      type="button"
                      onClick={() => {
                        setUnitSearch('');
                        setSelectedUnit('');
                        setPoints('');
                        setPointsLookedUp(false);
                      }}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--theme-fg-muted)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1
                      }}
                      title="Clear selection"
                    >
                      ×
                    </button>
                  )}
                </div>
                {/* Native datalist for autocomplete */}
                <datalist id="unit-suggestions">
                  {availableUnits.map(u => <option key={u} value={u} />)}
                </datalist>
                {/* Suggestion pills when few results */}
                {unitSearch.length >= 2 && availableUnits.length > 0 && availableUnits.length <= 8 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                    {availableUnits.map(u => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => {
                          setSelectedUnit(u);
                          setUnitSearch(u);
                          lookupUnitPoints(u, selectedFaction);
                        }}
                        style={{
                          padding: '2px 10px', fontSize: '0.75rem',
                          border: `1px solid ${selectedUnit === u ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                          backgroundColor: selectedUnit === u ? 'var(--theme-accent)' : 'var(--theme-bg)',
                          color: selectedUnit === u ? '#fff' : 'var(--theme-fg)',
                          borderRadius: '12px', cursor: 'pointer',
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Model count, Points, Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Models</label>
                <input
                  type="number" min={1} value={modelCount}
                  onChange={e => setModelCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>
                  Pts {pointsLookedUp && <span style={{ color: 'var(--theme-accent)', fontSize: '0.7rem' }}>✓ auto-filled</span>}
                </label>
                <input
                  type="number" min={0} value={points}
                  onChange={e => { setPoints(parseInt(e.target.value) || ''); setPointsLookedUp(false); }}
                  placeholder="—"
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box',
                    borderColor: pointsLookedUp ? 'var(--theme-accent)' : undefined }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Notes (optional)</label>
                <input
                  type="text" value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Magnetized, Proxied, Custom conversion..."
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="submit" disabled={addingUnit} className="btn primary" style={{ alignSelf: 'flex-start' }}>
                {addingUnit ? (editingUnitId ? 'Saving...' : 'Mustering...') : (editingUnitId ? 'Save Changes' : '+ Add to Roster')}
              </button>
              {editingUnitId && (
                <button type="button" onClick={() => { resetForm(); setFormMessage(''); }} className="btn secondary" style={{ alignSelf: 'flex-start' }}>
                  Cancel
                </button>
              )}
              {formMessage && <span style={{ fontSize: '0.8rem', color: 'var(--theme-accent)' }}>{formMessage}</span>}
            </div>
          </form>
        </div>
      )}

      {/* Roster Table */}
      {units.length === 0 ? (
        <p style={{ color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>
          {isOwner ? 'No units mustered yet. Add your first unit above.' : 'This Commander has not added any units yet.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--theme-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Unit</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Faction</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Models</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Pts</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>⚙ Built</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>🎨 Painted</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>⚔ Played</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>📷 Photo</th>
                {isOwner && <th style={{ padding: '0.5rem 0.75rem' }}></th>}
              </tr>
            </thead>
            <tbody>
              {units.map(u => {
                const alliance = u.faction ? factionAlliance(u.faction) : undefined;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 'bold' }}>
                      {u.unit_name}
                      {u.notes && <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', fontWeight: 'normal' }}>{u.notes}</div>}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      {u.faction ? (
                        <span style={{
                          fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px',
                          backgroundColor: alliance ? `${allianceColour[alliance]}22` : 'transparent',
                          border: `1px solid ${alliance ? allianceColour[alliance] : 'var(--theme-border)'}`,
                          color: alliance ? allianceColour[alliance] : 'var(--theme-fg-muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          {u.faction}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{u.model_count}</td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>{u.points ?? '—'}</td>
                    {(['built', 'painted', 'played'] as const).map(field => (
                      <td key={field} style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                        {isOwner ? (
                          <button
                            onClick={() => toggleField(u, field)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: '1.1rem', opacity: u[field] ? 1 : 0.3,
                              transition: 'opacity 0.15s',
                            }}
                            title={u[field] ? `Mark as not ${field}` : `Mark as ${field}`}
                          >
                            {u[field] ? '✅' : '⬜'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '1rem', opacity: u[field] ? 1 : 0.3 }}>
                            {u[field] ? '✅' : '⬜'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                      {u.image_url && (
                        <a href={u.image_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginBottom: isOwner ? '4px' : '0' }}>
                          <img src={u.image_url} alt="Unit" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--theme-border)' }} />
                        </a>
                      )}
                      {isOwner && u.faction && UNITS_BY_FACTION[u.faction]?.includes(u.unit_name) && (
                        <div>
                          <label style={{ cursor: uploadingUnitId === u.id ? 'wait' : 'pointer', fontSize: '0.7rem', color: 'var(--theme-accent)', textDecoration: 'underline' }}>
                            {uploadingUnitId === u.id ? 'Uploading...' : (u.image_url ? 'Replace' : 'Upload')}
                            <input type="file" accept="image/*" onChange={(e) => handleUploadPhoto(e, u)} disabled={uploadingUnitId === u.id} style={{ display: 'none' }} />
                          </label>
                        </div>
                      )}
                      {isOwner && (!u.faction || !UNITS_BY_FACTION[u.faction]?.includes(u.unit_name)) && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--theme-fg-muted)' }} title="Must be a validated official unit to upload photos">
                          Custom Unit
                        </span>
                      )}
                    </td>
                    {isOwner && (
                      <td style={{ padding: '0.6rem 0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditUnit(u)}
                          style={{ background: 'none', border: 'none', color: 'var(--theme-accent)', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(u.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--theme-fg-muted)', textAlign: 'right' }}>
            {total} entries · {units.reduce((s, u) => s + u.model_count, 0)} models
            {units.some(u => u.points) && ` · ${units.reduce((s, u) => s + (u.points ?? 0), 0)} pts`}
          </div>
        </div>
      )}
    </div>
  );
}
