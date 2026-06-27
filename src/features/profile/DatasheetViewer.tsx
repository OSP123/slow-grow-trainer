import type { CrucibleDatasheet } from './CommanderProfile';

export default function DatasheetViewer({ datasheet }: { datasheet: CrucibleDatasheet }) {
  const { stats, rangedWeapons, meleeWeapons, archetype, specialism, abilities, name } = datasheet;

  const thStyle = { backgroundColor: 'var(--theme-bg)', padding: '0.5rem', textAlign: 'left' as const, borderBottom: '1px solid var(--theme-border)', fontSize: '0.8rem', textTransform: 'uppercase' as const, color: 'var(--theme-fg-muted)' };
  const tdStyle = { padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' };
  const centerTd = { ...tdStyle, textAlign: 'center' as const };

  return (
    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--theme-border)', overflow: 'hidden', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--theme-bg)', padding: '1rem', borderBottom: '2px solid var(--theme-accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', textTransform: 'uppercase' }}>{name || 'Unnamed Champion'}</h4>
          {datasheet.points && <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--theme-accent)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{datasheet.points} PTS</div>}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--theme-fg-muted)' }}>
          {archetype || 'No Archetype'} {specialism ? `• ${specialism}` : ''}
        </div>
      </div>

      {/* Core Stats */}
      {stats && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', backgroundColor: 'var(--theme-bg)', padding: '0.5rem', borderRadius: '4px', textAlign: 'center' }}>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>M</div><div style={{ fontWeight: 'bold' }}>{stats.m || '-'}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>T</div><div style={{ fontWeight: 'bold' }}>{stats.t || '-'}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>SV</div><div style={{ fontWeight: 'bold' }}>{stats.sv || '-'}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>INV</div><div style={{ fontWeight: 'bold' }}>{stats.invuln || '-'}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>W</div><div style={{ fontWeight: 'bold' }}>{stats.w || '-'}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>LD</div><div style={{ fontWeight: 'bold' }}>{stats.ld || '-'}</div></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>OC</div><div style={{ fontWeight: 'bold' }}>{stats.oc || '-'}</div></div>
          </div>
        </div>
      )}

      {/* Ranged Weapons */}
      {rangedWeapons && rangedWeapons.length > 0 && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.25rem' }}>Ranged Weapons</h5>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Weapon</th>
                  <th style={{...thStyle, textAlign: 'center'}}>Range</th>
                  <th style={{...thStyle, textAlign: 'center'}}>A</th>
                  <th style={{...thStyle, textAlign: 'center'}}>BS</th>
                  <th style={{...thStyle, textAlign: 'center'}}>S</th>
                  <th style={{...thStyle, textAlign: 'center'}}>AP</th>
                  <th style={{...thStyle, textAlign: 'center'}}>D</th>
                </tr>
              </thead>
              <tbody>
                {rangedWeapons.map(w => (
                  <tr key={w.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold' }}>{w.name || 'Unnamed'}</div>
                      {w.keywords && <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>[{w.keywords}]</div>}
                    </td>
                    <td style={centerTd}>{w.range || '-'}</td>
                    <td style={centerTd}>{w.a || '-'}</td>
                    <td style={centerTd}>{w.bs || '-'}</td>
                    <td style={centerTd}>{w.s || '-'}</td>
                    <td style={centerTd}>{w.ap || '-'}</td>
                    <td style={centerTd}>{w.d || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Melee Weapons */}
      {meleeWeapons && meleeWeapons.length > 0 && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.25rem' }}>Melee Weapons</h5>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Weapon</th>
                  <th style={{...thStyle, textAlign: 'center'}}>Range</th>
                  <th style={{...thStyle, textAlign: 'center'}}>A</th>
                  <th style={{...thStyle, textAlign: 'center'}}>WS</th>
                  <th style={{...thStyle, textAlign: 'center'}}>S</th>
                  <th style={{...thStyle, textAlign: 'center'}}>AP</th>
                  <th style={{...thStyle, textAlign: 'center'}}>D</th>
                </tr>
              </thead>
              <tbody>
                {meleeWeapons.map(w => (
                  <tr key={w.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold' }}>{w.name || 'Unnamed'}</div>
                      {w.keywords && <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)', fontStyle: 'italic' }}>[{w.keywords}]</div>}
                    </td>
                    <td style={centerTd}>Melee</td>
                    <td style={centerTd}>{w.a || '-'}</td>
                    <td style={centerTd}>{w.ws || '-'}</td>
                    <td style={centerTd}>{w.s || '-'}</td>
                    <td style={centerTd}>{w.ap || '-'}</td>
                    <td style={centerTd}>{w.d || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Abilities */}
      {abilities && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.25rem' }}>Abilities</h5>
          <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {abilities}
          </div>
        </div>
      )}

      {/* Unit Keywords */}
      {datasheet.keywords && (
        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.25rem' }}>Keywords</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
            {datasheet.keywords.split(',').map((kw, i) => (
              <span key={i} style={{ padding: '2px 8px', backgroundColor: 'var(--theme-bg)', border: '1px solid var(--theme-border)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {kw.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
