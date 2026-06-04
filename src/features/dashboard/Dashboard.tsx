import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import Globe from 'react-globe.gl';

interface WarEffort {
  mega_faction: 'imperium' | 'chaos' | 'xenos';
  score: number;
}

// Predefined Theatres of War mapped to visual features on the generated texture
const THEATRES_OF_WAR = [
  { name: 'Hive Primus', lat: 15, lng: 10, narrative: 'The planetary capital and primary stronghold.' },
  { name: 'The Ash Wastes', lat: 0, lng: -120, narrative: 'Scorched deserts holding vital Promethium pipelines.' },
  { name: 'Magma Forges', lat: 45, lng: 40, narrative: 'Heavy industrial sector controlled by the Mechanicus.' },
  { name: 'Orbital Tether', lat: -10, lng: 140, narrative: 'The only reliable way off this rock.' },
  { name: 'The Sump', lat: -70, lng: -20, narrative: 'Deep underhive slums infested with mutants.' },
  { name: 'Rad-Zone Gamma', lat: 60, lng: -140, narrative: 'Irradiated badlands where ancient weapons sleep.' }
];

const FACTION_COLORS = {
  imperium: '#3b82f6', // Blue
  chaos: '#ef4444',    // Red
  xenos: '#22c55e'     // Green
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WarEffort[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const globeEl = useRef<any>(null);

  useEffect(() => {
    // Handle resize
    const handleResize = () => {
      if (typeof document === 'undefined') return;
      // Find the container width
      const container = document.getElementById('globe-container');
      if (container) {
        setWindowSize({ width: container.clientWidth, height: Math.min(600, window.innerHeight * 0.6) });
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial size
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

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

  useEffect(() => {
    // Set auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, [loading]);

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

  // Calculate total scores to distribute control
  const totalImperium = data.find(d => d.mega_faction === 'imperium')?.score || 0;
  const totalChaos = data.find(d => d.mega_faction === 'chaos')?.score || 0;
  const totalXenos = data.find(d => d.mega_faction === 'xenos')?.score || 0;
  
  const totalScore = totalImperium + totalChaos + totalXenos;

  // Determine control of theatres (Mock logic: assign theatres based on score percentage)
  const theatres = THEATRES_OF_WAR.map((theatre, index) => {
    let controllingFaction = 'imperium'; // default
    let color = FACTION_COLORS.imperium;

    if (totalScore > 0) {
      const impShare = totalImperium / totalScore;
      const chaosShare = totalChaos / totalScore;
      
      const threshold = index / THEATRES_OF_WAR.length;
      
      if (threshold < impShare) {
        controllingFaction = 'imperium';
        color = FACTION_COLORS.imperium;
      } else if (threshold < impShare + chaosShare) {
        controllingFaction = 'chaos';
        color = FACTION_COLORS.chaos;
      } else {
        controllingFaction = 'xenos';
        color = FACTION_COLORS.xenos;
      }
    }

    // Add some random size to the marker
    const size = Math.random() * 0.5 + 0.5;

    return {
      ...theatre,
      controllingFaction,
      color,
      size
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>War Effort Results</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          {data.map((effort, index) => (
            <div 
              key={index} 
              style={{ 
                flex: '1 1 200px',
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'var(--theme-bg)',
                border: `1px solid var(--theme-border)`,
                borderLeft: `4px solid ${FACTION_COLORS[effort.mega_faction]}`,
                textTransform: 'capitalize',
                letterSpacing: '1px',
                fontFamily: 'var(--font-head)'
              }}
            >
              <span style={{ color: 'var(--theme-fg)' }}>{effort.mega_faction}</span>
              <span style={{ color: 'var(--theme-accent)', fontWeight: 'bold' }}>{effort.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" id="globe-container" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--theme-border)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--theme-accent)' }}>Vespera Prime Theater Display</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>Interactive Command Globe</p>
        </div>
        
        {windowSize.width > 0 && (
          <Globe
            ref={globeEl}
            width={windowSize.width}
            height={windowSize.height}
            globeImageUrl="/images/planet-texture.png"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            htmlElementsData={theatres}
            htmlLat="lat"
            htmlLng="lng"
            htmlElement={(d: any) => {
              const el = document.createElement('div');
              el.innerHTML = `
                <div style="
                  width: 24px;
                  height: 24px;
                  border: 2px solid #ef4444;
                  border-radius: 50%;
                  position: relative;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  cursor: pointer;
                  pointer-events: auto;
                  box-shadow: 0 0 8px #ef4444, inset 0 0 8px #ef4444;
                  transition: transform 0.2s ease-in-out;
                ">
                  <div style="position: absolute; width: 34px; height: 2px; background: #ef4444; top: 50%; left: -5px; transform: translateY(-50%); opacity: 0.7;"></div>
                  <div style="position: absolute; height: 34px; width: 2px; background: #ef4444; left: 50%; top: -5px; transform: translateX(-50%); opacity: 0.7;"></div>
                  <div style="width: 6px; height: 6px; background: ${d.color}; border-radius: 50%; box-shadow: 0 0 10px ${d.color}; z-index: 2;"></div>
                  
                  <div class="reticle-tooltip" style="
                    display: none;
                    position: absolute;
                    bottom: 35px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.9);
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid ${d.color};
                    font-family: sans-serif;
                    white-space: nowrap;
                    z-index: 100;
                    pointer-events: none;
                  ">
                    <strong style="color: ${d.color}; display: block; margin-bottom: 4px; font-size: 1.1em;">${d.name}</strong>
                    <span style="color: #ccc; display: block; margin-bottom: 4px;">Controlled by: <span style="text-transform: capitalize; color: #fff;">${d.controllingFaction}</span></span>
                    <i style="color: #999; font-size: 0.9em; max-width: 200px; display: block; white-space: normal;">"${d.narrative}"</i>
                  </div>
                </div>
              `;
              
              el.onmouseenter = () => {
                const tooltip = el.querySelector('.reticle-tooltip') as HTMLElement;
                if (tooltip) tooltip.style.display = 'block';
                (el.firstElementChild as HTMLElement).style.transform = 'scale(1.2)';
              };
              el.onmouseleave = () => {
                const tooltip = el.querySelector('.reticle-tooltip') as HTMLElement;
                if (tooltip) tooltip.style.display = 'none';
                (el.firstElementChild as HTMLElement).style.transform = 'scale(1)';
              };
              
              return el;
            }}
          />
        )}
      </div>
    </div>
  );
}
