import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from '../../supabaseClient';
import Globe from 'react-globe.gl';
import { Castle, Factory, Satellite, Skull, Biohazard, Mountain, Target } from 'lucide-react';
import { FACTIONS } from '../../data/warhammer40k';

const THEATRES_OF_WAR = [
  { name: 'Hive Primus', lat: 15, lng: 20, narrative: 'The planetary capital and primary stronghold.', Icon: Castle }, // Africa
  { name: 'The Ash Wastes', lat: 25, lng: 10, narrative: 'Scorched deserts holding vital Promethium pipelines.', Icon: Mountain }, // Sahara, Africa
  { name: 'Magma Forges', lat: 45, lng: 60, narrative: 'Heavy industrial sector controlled by the Mechanicus.', Icon: Factory }, // Kazakhstan/Russia
  { name: 'Orbital Tether', lat: -10, lng: -55, narrative: 'The only reliable way off this rock.', Icon: Satellite }, // Brazil, South America
  { name: 'The Sump', lat: -25, lng: 135, narrative: 'Deep underhive slums infested with mutants.', Icon: Skull }, // Central Australia
  { name: 'Rad-Zone Gamma', lat: 60, lng: -110, narrative: 'Irradiated badlands where ancient weapons sleep.', Icon: Biohazard } // Northern Canada
];

const FACTION_COLORS = {
  imperium: '#3b82f6', // Blue
  chaos: '#ef4444',    // Red
  xenos: '#22c55e'     // Green
};

// Deterministic scatter offsets
function getDeterministicOffset(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const latR = Math.sin(hash) * 10000;
  const lngR = Math.cos(hash) * 10000;
  return {
    latOffset: (latR - Math.floor(latR)) * 12 - 6, // [-6, +6] degrees spread
    lngOffset: (lngR - Math.floor(lngR)) * 12 - 6
  };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [theatres, setTheatres] = useState<any[]>([]);
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
          setTheatres(THEATRES_OF_WAR.map(t => ({ ...t, isBase: true, color: '#ef4444' })));
        } else if (matchups) {
          const allElements: any[] = [];

          THEATRES_OF_WAR.forEach(baseTheatre => {
            // 1. Add the Base Theatre anchor point
            allElements.push({
              ...baseTheatre,
              isBase: true,
              color: '#64748b', // Slate gray for the unaligned base anchor
              controllingFaction: 'Contested War Zone',
              warlord: null
            });

            // 2. Find all matches fought in this parent theatre
            const matchesInTheatre = matchups.filter(m => m.theatre_name && m.theatre_name.startsWith(baseTheatre.name));

            // 3. Add victorious sub-sectors
            matchesInTheatre.forEach((match) => {
              const isP1Win = match.game_result === 'p1_win';
              const isP2Win = match.game_result === 'p2_win';
              if (match.game_result === 'draw' || (!isP1Win && !isP2Win)) return;

              let winnerProfile: any = isP1Win ? match.p1_profile : match.p2_profile;
              if (Array.isArray(winnerProfile)) winnerProfile = winnerProfile[0];
              if (!winnerProfile) return;

              const factionData = FACTIONS.find(f => f.name === winnerProfile.army_faction);
              const color = factionData ? FACTION_COLORS[factionData.grandAlliance as keyof typeof FACTION_COLORS] : '#aaaaaa';

              const { latOffset, lngOffset } = getDeterministicOffset(match.theatre_name || match.p1_id);

              allElements.push({
                name: match.theatre_name || `${baseTheatre.name} - Sector Unknown`,
                lat: baseTheatre.lat + latOffset,
                lng: baseTheatre.lng + lngOffset,
                narrative: `Sub-sector conquered by ${winnerProfile.commander_name}.`,
                Icon: Target, // Use a distinct 'Target' icon for sub-sectors to differentiate from the Base
                isBase: false,
                color,
                controllingFaction: winnerProfile.army_faction,
                warlord: winnerProfile.commander_name,
                avatar: winnerProfile.avatar_url,
                lore: winnerProfile.army_lore
              });
            });
          });

          setTheatres(allElements);
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
          Vespera Prime is divided into 6 critical Theatres of War. As Commanders claim victories, new Sub-Sectors will visually expand around the core Theatres!
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
                <span style="color: #ccc; display: block; font-style: italic;">Core staging area. No direct warlord control.</span>
              `;

              const Icon = d.Icon;
              // Sub-sectors are smaller and use Target icon
              const boxSize = d.isBase ? '32px' : '20px';
              const lineSize = d.isBase ? '42px' : '28px';
              const iconSize = d.isBase ? 16 : 10;

              root.render(
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: boxSize,
                      height: boxSize,
                      border: `2px solid ${d.color}`,
                      borderRadius: '50%',
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      boxShadow: `0 0 ${d.isBase ? 12 : 6}px ${d.color}, inset 0 0 4px ${d.color}`,
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
                    <div style={{ position: 'absolute', width: lineSize, height: '2px', background: d.color, top: '50%', left: '-5px', transform: 'translateY(-50%)', opacity: 0.7 }}></div>
                    <div style={{ position: 'absolute', height: lineSize, width: '2px', background: d.color, left: '50%', top: '-5px', transform: 'translateX(-50%)', opacity: 0.7 }}></div>
                    <Icon size={iconSize} color={d.color} style={{ zIndex: 2, filter: `drop-shadow(0 0 5px ${d.color})` }} />
                  </div>
                  
                  <div className="reticle-tooltip" style={{
                    display: 'none',
                    position: 'absolute',
                    bottom: d.isBase ? '45px' : '35px',
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
