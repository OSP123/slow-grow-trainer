import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const OPENHAMMER = 'https://openhammer-api-production.up.railway.app';

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
}

interface OpenHammerFaction {
  name: string;
  faction_type: string;
  unit_count: number;
}

interface OpenHammerUnit {
  name: string;
  id: string;
  points: { base: number };
  composition: { min_models: number; max_models: number };
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

export default function ArmyRoster({ profileId, isOwner }: Props) {
  const [units, setUnits] = useState<ArmyUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Add unit form state
  const [factions, setFactions] = useState<OpenHammerFaction[]>([]);
  const [selectedFaction, setSelectedFaction] = useState('');
  const [apiUnits, setApiUnits] = useState<OpenHammerUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedUnitPoints, setSelectedUnitPoints] = useState<number | ''>('');
  const [modelCount, setModelCount] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [addingUnit, setAddingUnit] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [manualName, setManualName] = useState('');
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

  const fetchFactions = async () => {
    try {
      const res = await fetch(`${OPENHAMMER}/factions`);
      if (!res.ok) throw new Error('Failed');
      const data: OpenHammerFaction[] = await res.json();
      setFactions(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setApiFailed(true);
    }
  };

  useEffect(() => {
    fetchRoster();
    if (isOwner) fetchFactions();
  }, [profileId, isOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFactionChange = async (factionName: string) => {
    setSelectedFaction(factionName);
    setSelectedUnit('');
    setSelectedUnitPoints('');
    if (!factionName) { setApiUnits([]); return; }
    try {
      const res = await fetch(`${OPENHAMMER}/units?faction=${encodeURIComponent(factionName)}`);
      if (!res.ok) throw new Error('Failed');
      const data: OpenHammerUnit[] = await res.json();
      setApiUnits(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setApiFailed(true);
      setApiUnits([]);
    }
  };

  const handleUnitSelect = (unitName: string) => {
    setSelectedUnit(unitName);
    const found = apiUnits.find(u => u.name === unitName);
    setSelectedUnitPoints(found?.points?.base ?? '');
    const min = found?.composition?.min_models ?? 1;
    setModelCount(min);
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = apiFailed ? manualName : selectedUnit;
    if (!name) { setFormMessage('Select or enter a unit name.'); return; }
    setAddingUnit(true);
    setFormMessage('');
    const { error } = await supabase.from('army_units').insert({
      profile_id: profileId,
      unit_name: name,
      faction: selectedFaction || null,
      model_count: modelCount,
      points: selectedUnitPoints !== '' ? selectedUnitPoints : null,
      notes: notes || null,
      built: false,
      painted: false,
      played: false,
    });
    if (error) {
      setFormMessage('Error: ' + error.message);
    } else {
      setSelectedUnit('');
      setManualName('');
      setModelCount(1);
      setNotes('');
      setSelectedUnitPoints('');
      setFormMessage('Unit added to roster.');
      fetchRoster();
    }
    setAddingUnit(false);
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

  const total = units.length;
  const builtCount = units.filter(u => u.built).length;
  const paintedCount = units.filter(u => u.painted).length;
  const playedCount = units.filter(u => u.played).length;

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
            Add Unit to Roster
          </h3>
          <form onSubmit={handleAddUnit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!apiFailed ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Faction</label>
                    <select
                      value={selectedFaction}
                      onChange={e => handleFactionChange(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                    >
                      <option value="">Select faction...</option>
                      {factions.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Unit</label>
                    <select
                      value={selectedUnit}
                      onChange={e => handleUnitSelect(e.target.value)}
                      disabled={!selectedFaction || apiUnits.length === 0}
                      style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                    >
                      <option value="">Select unit...</option>
                      {apiUnits.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Unit Name (manual)</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="e.g. Intercessor Squad"
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Model Count</label>
                <input
                  type="number" min={1} value={modelCount}
                  onChange={e => setModelCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Points</label>
                <input
                  type="number" min={0} value={selectedUnitPoints}
                  onChange={e => setSelectedUnitPoints(parseInt(e.target.value) || '')}
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>Notes</label>
                <input
                  type="text" value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Magnetized, Proxied..."
                  style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button type="submit" disabled={addingUnit} className="btn primary" style={{ alignSelf: 'flex-start' }}>
              {addingUnit ? 'Adding...' : '+ Add to Roster'}
            </button>
            {formMessage && <div style={{ fontSize: '0.8rem', color: 'var(--theme-accent)' }}>{formMessage}</div>}
          </form>
        </div>
      )}

      {/* Roster Table */}
      {units.length === 0 ? (
        <p style={{ color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>
          {isOwner ? 'No units added yet. Begin building your roster above.' : 'This Commander has not added any units yet.'}
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
                {isOwner && <th style={{ padding: '0.5rem 0.75rem' }}></th>}
              </tr>
            </thead>
            <tbody>
              {units.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--theme-border)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 'bold' }}>
                    {u.unit_name}
                    {u.notes && <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', fontWeight: 'normal' }}>{u.notes}</div>}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--theme-fg-muted)', fontSize: '0.8rem' }}>{u.faction || '—'}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{u.model_count}</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>{u.points ?? '—'}</td>
                  {(['built', 'painted', 'played'] as const).map(field => (
                    <td key={field} style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                      {isOwner ? (
                        <button
                          onClick={() => toggleField(u, field)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1.1rem',
                            opacity: u[field] ? 1 : 0.3,
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
                  {isOwner && (
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <button
                        onClick={() => handleDeleteUnit(u.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {total > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--theme-fg-muted)', textAlign: 'right' }}>
              Total: {units.reduce((sum, u) => sum + u.model_count, 0)} models · {units.reduce((sum, u) => sum + (u.points ?? 0), 0)} pts
            </div>
          )}
        </div>
      )}
    </div>
  );
}
