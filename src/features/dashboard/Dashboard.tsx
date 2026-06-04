import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from '../../supabaseClient';
import Globe from 'react-globe.gl';
import { Castle, Factory, Satellite, Skull, Biohazard, Mountain } from 'lucide-react';
import { FACTIONS } from '../../data/warhammer40k';





const THEATRES_OF_WAR = [
  { name: 'Hive Primus', lat: 15, lng: 10, narrative: 'The planetary capital and primary stronghold.', Icon: Castle },
  { name: 'The Ash Wastes', lat: 0, lng: -120, narrative: 'Scorched deserts holding vital Promethium pipelines.', Icon: Mountain },
  { name: 'Magma Forges', lat: 45, lng: 40, narrative: 'Heavy industrial sector controlled by the Mechanicus.', Icon: Factory },
  { name: 'Orbital Tether', lat: 10, lng: 90, narrative: 'The only reliable way off this rock.', Icon: Satellite },
  { name: 'The Sump', lat: -20, lng: 110, narrative: 'Deep underhive slums infested with mutants.', Icon: Skull },
  { name: 'Rad-Zone Gamma', lat: 60, lng: -140, narrative: 'Irradiated badlands where ancient weapons sleep.', Icon: Biohazard }
];

const FACTION_COLORS = {
  imperium: '#3b82f6', // Blue
  chaos: '#ef4444',    // Red
  xenos: '#22c55e'     // Green
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [theatres, setTheatres] = useState<any[]>(THEATRES_OF_WAR);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  const globeEl = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      if (typeof document === 'undefined') return;
      const container = document.getElementById('globe-container');
      if (container) {
        setWindowSize({ width: container.clientWidth, height: Math.min(600, window.innerHeight * 0.6) });
      }
    };

    window.addEventListener('resize', handleResize);
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    async function fetchEffort() {
      try {
        const { data: matchups, error } = await supabase
          .from('matchups')
          .select('theatre_name, game_result, p1_id, p2_id, p1_profile:profiles!p1_id(commander_name, army_faction, avatar_url, army_lore), p2_profile:profiles!p2_id(commander_name, army_faction, avatar_url, army_lore)')
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching matchups', error);
        } else if (matchups) {
          const updatedTheatres = THEATRES_OF_WAR.map(theatre => {
            const latestMatch = matchups.find(m => m.theatre_name === theatre.name);
            
            let controllingFaction = 'Unknown';
            let color = '#aaaaaa'; // Neutral gray
            let warlord = null;
            let avatar = null;
            let lore = null;

            if (latestMatch) {
              const isP1Win = latestMatch.game_result === 'p1_win';
              const isP2Win = latestMatch.game_result === 'p2_win';
              const isDraw = latestMatch.game_result === 'draw';
              
              if (!isDraw && (isP1Win || isP2Win)) {
                let winnerProfile: any = isP1Win ? latestMatch.p1_profile : latestMatch.p2_profile;
                if (Array.isArray(winnerProfile)) winnerProfile = winnerProfile[0];
                
                if (winnerProfile) {
                  warlord = winnerProfile.commander_name;
                  avatar = winnerProfile.avatar_url;
                  lore = winnerProfile.army_lore;
                  
                  const factionData = FACTIONS.find(f => f.name === winnerProfile.army_faction);
                  if (factionData) {
                    controllingFaction = winnerProfile.army_faction;
                    color = FACTION_COLORS[factionData.grandAlliance as keyof typeof FACTION_COLORS] || color;
                  }
                }
              }
            }

            return {
              ...theatre,
              controllingFaction,
              color,
              warlord,
              avatar,
              lore
            };
          });
          
          setTheatres(updatedTheatres);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEffort();
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, [loading]);

  if (loading) {
    return <div style={{ color: 'var(--theme-fg-muted)' }}>Synchronizing Telemetry...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Global Command Interface</h2>
        <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '1rem' }}>
          Vespera Prime is divided into 6 critical Theatres of War. Win battles at these locations to claim them as your Warlord domain!
        </p>
      </div>

      <div className="card" id="globe-container" style={{ padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, background: 'rgba(0,0,0,0.85)', padding: '0.75rem 1.25rem', borderRadius: '6px', border: '1px solid var(--theme-border)', backdropFilter: 'blur(4px)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--theme-accent)' }}>Vespera Prime</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>Tactical Hologlobe (Hover over reticles)</p>
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
              const root = createRoot(el);
              
              const tooltipContent = d.warlord ? `
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                  ${d.avatar ? `<img src="${d.avatar}" style="width: 50px; height: 50px; border-radius: 4px; border: 1px solid ${d.color}; object-fit: cover;" />` : ''}
                  <div>
                    <span style="color: #ccc; display: block; margin-bottom: 2px; font-size: 0.8em; text-transform: uppercase; letter-spacing: 1px;">Warlord</span>
                    <strong style="color: #fff; display: block; margin-bottom: 4px; font-size: 1.1em;">${d.warlord}</strong>
                    <span style="color: ${d.color}; display: block; margin-bottom: 4px; font-size: 0.9em; font-weight: bold;">${d.controllingFaction}</span>
                  </div>
                </div>
                ${d.lore ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); color: #999; font-size: 0.85em; font-style: italic; max-width: 250px; white-space: normal;">"${d.lore.substring(0, 100)}${d.lore.length > 100 ? '...' : ''}"</div>` : ''}
              ` : `
                <span style="color: #ccc; display: block; font-style: italic;">No Commander has claimed this territory.</span>
              `;

              const Icon = d.Icon;

              root.render(
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '2px solid #ef4444',
                      borderRadius: '50%',
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      boxShadow: '0 0 12px #ef4444, inset 0 0 8px #ef4444',
                      transition: 'transform 0.2s ease-in-out',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(2px)'
                    }}
                    onMouseEnter={(e) => {
                      const tgt = e.currentTarget;
                      tgt.style.transform = 'scale(1.25)';
                      const tooltip = tgt.nextElementSibling as HTMLElement;
                      if (tooltip) tooltip.style.display = 'block';
                    }}
                    onMouseLeave={(e) => {
                      const tgt = e.currentTarget;
                      tgt.style.transform = 'scale(1)';
                      const tooltip = tgt.nextElementSibling as HTMLElement;
                      if (tooltip) tooltip.style.display = 'none';
                    }}
                  >
                    <div style={{ position: 'absolute', width: '42px', height: '2px', background: '#ef4444', top: '50%', left: '-5px', transform: 'translateY(-50%)', opacity: 0.7 }}></div>
                    <div style={{ position: 'absolute', height: '42px', width: '2px', background: '#ef4444', left: '50%', top: '-5px', transform: 'translateX(-50%)', opacity: 0.7 }}></div>
                    <Icon size={16} color={d.color} style={{ zIndex: 2, filter: `drop-shadow(0 0 5px ${d.color})` }} />
                  </div>
                  
                  <div className="reticle-tooltip" style={{
                    display: 'none',
                    position: 'absolute',
                    bottom: '45px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10, 10, 15, 0.95)',
                    padding: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${d.color}`,
                    fontFamily: 'sans-serif',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    pointerEvents: 'none',
                    boxShadow: `0 4px 15px rgba(0,0,0,0.5), 0 0 10px ${d.color}40`
                  }}>
                    <strong style={{ color: d.color, display: 'block', marginBottom: '8px', fontSize: '1.2em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                      {d.name}
                    </strong>
                    <i style={{ color: '#aaa', fontSize: '0.85em', maxWidth: '250px', display: 'block', whiteSpace: 'normal', marginBottom: '12px' }}>
                      "{d.narrative}"
                    </i>
                    <div dangerouslySetInnerHTML={{ __html: tooltipContent }} />
                  </div>
                </div>
              );
              
              return el;
            }}
          />
        )}
      </div>
    </div>
  );
}
