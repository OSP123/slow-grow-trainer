const fs = require('fs');
let code = fs.readFileSync('src/features/profile/ArmyRoster.tsx', 'utf8');

const oldCode = `
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
                      if (selectedFaction && unitsByFaction[selectedFaction]?.includes(val)) {
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
                          background: 'var(--theme-bg-secondary)', border: '1px solid var(--theme-border)',
                          borderRadius: '12px', cursor: 'pointer', color: 'var(--theme-fg)'
                        }}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
              </div>
`;

const newCode = `
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--theme-fg-muted)' }}>
                  Unit {!selectedFaction && <span style={{ color: 'var(--theme-fg-muted)' }}>(select faction first, or type freely)</span>}
                </label>
                
                {selectedFaction && availableUnits.length > 0 ? (
                  <select
                    value={selectedUnit || unitSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setUnitSearch(val);
                      setSelectedUnit(val);
                      setPointsLookedUp(false);
                      if (val) {
                        lookupUnitPoints(val, selectedFaction);
                      }
                    }}
                    style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }}
                  >
                    <option value="">-- Select a unit from {selectedFaction} --</option>
                    {availableUnits.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={selectedUnit || unitSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setUnitSearch(val);
                        setSelectedUnit('');
                        setPointsLookedUp(false);
                      }}
                      placeholder="Type unit name..."
                      style={{ width: '100%', padding: '0.6rem', paddingRight: '2rem', boxSizing: 'border-box' }}
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
                          position: 'absolute', right: '8px', background: 'none', border: 'none',
                          color: 'var(--theme-fg-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: 0
                        }}
                        title="Clear selection"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
`;

code = code.replace(oldCode.trim(), newCode.trim());
fs.writeFileSync('src/features/profile/ArmyRoster.tsx', code);
console.log('Replaced');
