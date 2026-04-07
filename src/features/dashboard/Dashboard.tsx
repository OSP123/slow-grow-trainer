import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface WarEffort {
  mega_faction: 'imperium' | 'chaos' | 'xenos';
  score: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WarEffort[]>([]);

  useEffect(() => {
    async function fetchEffort() {
      try {
        const { data: scores, error } = await supabase
          .from('war_efforts')
          .select('*');

        if (error) {
          console.error('Error fetching war efforts', error);
        } else if (scores) {
          setData(scores);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEffort();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--theme-fg-muted)' }}>Synchronizing Telemetry...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sector Status</h2>
        <p style={{ color: 'var(--theme-fg-muted)' }}>
          No telemetry data available.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>War Effort Results</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.map((effort, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '1rem',
              backgroundColor: 'var(--theme-bg)',
              border: `1px solid var(--theme-border)`,
              textTransform: 'capitalize',
              letterSpacing: '1px',
              fontFamily: 'var(--font-head)'
            }}
          >
            <span style={{ color: 'var(--theme-fg)' }}>{effort.mega_faction}:</span>
            <span style={{ color: 'var(--theme-accent)', fontWeight: 'bold' }}>{effort.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
