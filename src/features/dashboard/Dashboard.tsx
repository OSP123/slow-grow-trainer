import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Globe from 'react-globe.gl';
import { Castle, Factory, Satellite, Skull, Biohazard, Mountain, Target } from 'lucide-react';
import { FACTIONS } from '../../data/warhammer40k';
import { getTransformUrl } from '../../utils/imageCompression';

const THEATRES_OF_WAR = [
  { name: 'Hive Primus', lat: 15, lng: 20, narrative: 'The planetary capital and primary stronghold.', Icon: Castle, image: 'hive_primus.png' }, // Africa
  { name: 'The Ash Wastes', lat: 25, lng: 10, narrative: 'Scorched deserts holding vital Promethium pipelines.', Icon: Mountain, image: 'the_ash_wastes.jpg' }, // Sahara, Africa
  { name: 'Magma Forges', lat: 45, lng: 60, narrative: 'Heavy industrial sector controlled by the Mechanicus.', Icon: Factory, image: 'magma_forges.jpg' }, // Kazakhstan/Russia
  { name: 'Orbital Tether', lat: -10, lng: -55, narrative: 'The only reliable way off this rock.', Icon: Satellite, image: 'orbital_tether.png' }, // Brazil, South America
  { name: 'The Sump', lat: -25, lng: 135, narrative: 'Deep underhive slums infested with mutants.', Icon: Skull, image: 'the_sump.jpg' }, // Central Australia
  { name: 'Rad-Zone Gamma', lat: 60, lng: -110, narrative: 'Irradiated badlands where ancient weapons sleep.', Icon: Biohazard, image: 'rad_zone_gamma.png' } // Northern Canada
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
  const [selectedTheatre, setSelectedTheatre] = useState<any>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [commanders, setCommanders] = useState<any[]>([]);
  const globeEl = useRef<any>(null);

  const [activeTheme, setActiveTheme] = useState(document.body.getAttribute('data-theme') || 'imperium');

  useEffect(() => {
    // Watch for theme changes from the sidebar dropdown
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setActiveTheme(document.body.getAttribute('data-theme') || 'imperium');
        }
      });
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const isNonImperial = !['imperium', 'space_marines', 'astra_militarum', 'adeptus_mechanicus', 'adepta_sororitas', 'adeptus_custodes', 'imperial_knights'].includes(activeTheme);
  const isXenos = ['necrons', 'tau', 'aeldari', 'drukhari', 'orks'].includes(activeTheme);
  const needsLowercase = ['necrons', 'tau', 'aeldari', 'drukhari'].includes(activeTheme);
  const terminalClass = isXenos ? 'xenos' : 'imperial';

  // @ts-ignore
  const [topCommanders, setTopCommanders] = useState<any[]>([]);
  // @ts-ignore
  const [recentNarratives, setRecentNarratives] = useState<any[]>([]);
  // @ts-ignore
  const [allCommandersData, setAllCommandersData] = useState<any[]>([]);
  // @ts-ignore
  const [theatreEffort, setTheatreEffort] = useState<any[]>([]);

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
          .select('theatre_name, game_result, p1_id, p2_id, p1_lore, p2_lore, p1_profile:profiles!p1_id(commander_name, army_faction, avatar_url, army_lore), p2_profile:profiles!p2_id(commander_name, army_faction, avatar_url, army_lore)')
          .in('game_result', ['P1_WIN', 'P2_WIN']);

        if (error) {
          console.error("Error fetching matchups:", error);
          setTheatres(THEATRES_OF_WAR.map(t => ({ ...t, isBase: true, color: '#ef4444' })));
          return;
        }

        if (matchups) {
          const effortCount: { [theatre: string]: { Imperium: number; Chaos: number; Xenos: number } } = {};
          
          matchups.forEach((m: any) => {
            const theatre = m.theatre_name || 'Unknown Theatre';
            if (!effortCount[theatre]) {
              effortCount[theatre] = { Imperium: 0, Chaos: 0, Xenos: 0 };
            }

            const winnerProfile = m.game_result === 'P1_WIN' ? m.p1_profile : m.p2_profile;
            
            if (winnerProfile?.army_faction) {
              const factionData = FACTIONS.find(f => f.name === winnerProfile.army_faction);
              if (factionData) {
                effortCount[theatre][factionData.grandAlliance as 'Imperium' | 'Chaos' | 'Xenos']++;
              }
            }
          });

          const summary = Object.entries(effortCount).map(([theatre, counts]) => {
            const total = counts.Imperium + counts.Chaos + counts.Xenos;
            let controllingAlliance = 'Contested';
            let controllingFaction = 'Mixed';
            
            if (counts.Imperium > counts.Chaos && counts.Imperium > counts.Xenos) {
              controllingAlliance = 'Imperium';
            } else if (counts.Chaos > counts.Imperium && counts.Chaos > counts.Xenos) {
              controllingAlliance = 'Chaos';
            } else if (counts.Xenos > counts.Imperium && counts.Xenos > counts.Chaos) {
              controllingAlliance = 'Xenos';
            }
            
            const factionWins: { [faction: string]: number } = {};
            matchups.filter((m: any) => m.theatre_name === theatre).forEach((m: any) => {
              const winnerProfile = m.game_result === 'P1_WIN' ? m.p1_profile : m.p2_profile;
              if (winnerProfile?.army_faction) {
                factionWins[winnerProfile.army_faction] = (factionWins[winnerProfile.army_faction] || 0) + 1;
              }
            });
            
            if (Object.keys(factionWins).length > 0) {
              const topFaction = Object.entries(factionWins).sort((a, b) => b[1] - a[1])[0];
              controllingFaction = topFaction[0];
            }

            return {
              theatre,
              imperium: counts.Imperium,
              chaos: counts.Chaos,
              xenos: counts.Xenos,
              total,
              controllingAlliance,
              controllingFaction
            };
          });

          setTheatreEffort(summary);
          
          const commandersWins: { [id: string]: { wins: number, profile: any } } = {};
          matchups.forEach((m: any) => {
            const winnerId = m.game_result === 'P1_WIN' ? m.p1_id : m.p2_id;
            const winnerProfile = m.game_result === 'P1_WIN' ? m.p1_profile : m.p2_profile;
            
            if (winnerId && winnerProfile) {
              if (!commandersWins[winnerId]) commandersWins[winnerId] = { wins: 0, profile: winnerProfile };
              commandersWins[winnerId].wins++;
            }
          });
          
          const sortedCommanders = Object.values(commandersWins)
            .sort((a, b) => b.wins - a.wins)
            .slice(0, 3)
            .map(c => c.profile);
            
          setTopCommanders(sortedCommanders);
          
          const narratives = matchups
            .filter((m: any) => m.p1_lore || m.p2_lore)
            .slice(0, 5)
            .map((m: any) => ({
              theatre: m.theatre_name,
              winner: m.game_result === 'P1_WIN' ? m.p1_profile?.commander_name : m.p2_profile?.commander_name,
              lore: m.game_result === 'P1_WIN' ? m.p1_lore : m.p2_lore
            }));
            
          setRecentNarratives(narratives);

          const allElements: any[] = [];
          THEATRES_OF_WAR.forEach(baseTheatre => {
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

              let p1Profile: any = match.p1_profile;
              if (Array.isArray(p1Profile)) p1Profile = p1Profile[0];
              
              let p2Profile: any = match.p2_profile;
              if (Array.isArray(p2Profile)) p2Profile = p2Profile[0];

              const { latOffset, lngOffset } = getDeterministicOffset(match.theatre_name || match.p1_id);

              allElements.push({
                name: match.theatre_name || `${baseTheatre.name} - Sector Unknown`,
                lat: baseTheatre.lat + latOffset,
                lng: baseTheatre.lng + lngOffset,
                narrative: `Sub-sector conquered by ${winnerProfile.commander_name}.`,
                Icon: Target, // Use a distinct 'Target' icon for sub-sectors to differentiate from the Base
                isBase: false,
                color,
                image: baseTheatre.image,
                controllingFaction: winnerProfile.army_faction,
                warlord: winnerProfile.commander_name,
                avatar: winnerProfile.avatar_url,
                lore: winnerProfile.army_lore,
                p1Lore: match.p1_lore,
                p2Lore: match.p2_lore,
                p1Name: p1Profile?.commander_name || 'Commander',
                p2Name: p2Profile?.commander_name || 'Commander',
                winnerId: isP1Win ? match.p1_id : (isP2Win ? match.p2_id : null),
                p1Id: match.p1_id,
                p2Id: match.p2_id
              });
            });
          });

          setTheatres(allElements);
        }

        try {
          const { data: eventData } = await supabase.from('global_events').select('*').eq('is_active', true).maybeSingle();
          if (eventData) setActiveEvent(eventData);
        } catch (err) {}
        try {
          const { data: cmdrs } = await supabase
            .from('profiles')
            .select('id, commander_name, army_faction, army_subfaction, avatar_url, army_lore, campaign_status')
            .order('commander_name', { ascending: true });
            
          if (cmdrs) {
            setCommanders(cmdrs.filter(c => c.campaign_status !== 'Paused' && c.campaign_status !== 'Removed'));
          }
        } catch (err) {}
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

  // Variables isNonImperial, isXenos, needsLowercase are defined above using activeTheme

  const factionTally: Record<string, number> = commanders.reduce((acc: Record<string, number>, cmd: any) => {
    const faction = cmd.army_faction || 'Unknown Faction';
    acc[faction] = (acc[faction] || 0) + 1;
    return acc;
  }, {});

  const sortedFactions: [string, number][] = Object.entries(factionTally).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {activeEvent && (
        <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, rgba(168, 85, 247, 0.2), transparent)', borderLeft: '4px solid #a855f7', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#a855f7', fontSize: '1.5rem' }}>⚠️</span>
            <h3 style={{ margin: 0, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '2px' }}>Sector-Wide Alert: {activeEvent.title}</h3>
          </div>
          <p style={{ color: '#fff', fontSize: '1.1rem', margin: 0, lineHeight: 1.5 }}>
            {activeEvent.description}
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden', border: '1px solid #1a2e1a' }}>
        <div style={{ backgroundColor: '#0a140a', padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a2e1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: isXenos ? '#ef4444' : '#4ade80', fontSize: '1.2rem', fontFamily: isXenos ? 'var(--font-head)' : 'monospace' }}>_</span>
          <h2 
            data-text={isXenos ? 'INTERCEPTED TRANSMISSION :: SECTOR COMMAND' : undefined}
            style={{ 
              fontSize: '1rem', 
              margin: 0, 
              color: isXenos ? '#ef4444' : '#4ade80', 
              fontFamily: isXenos ? 'var(--font-head)' : 'monospace', 
              textTransform: isXenos ? 'none' : 'uppercase', 
              letterSpacing: '1px' 
            }}
          >
            {needsLowercase ? 'intercepted transmission :: sector command' : (isNonImperial ? 'INTERCEPTED TRANSMISSION :: SECTOR COMMAND' : 'INCOMING COMMUNIQUE :: SECTOR COMMAND')}
          </h2>
        </div>
        <div className={`terminal-communique ${terminalClass}`}>
          <p style={{ margin: 0 }} data-text={isXenos ? "Vespera Prime, a planet only a few lightyears away from noble Elysia. Once a verdant agriworld thousands of years past, it is now a planet hostile to nearly all life, a casualty from the days of the Horus Heresy. Millennia of war have broken the crust, revealing continents of volcanic activity and rivers of magma. Ancient fields of forest have become ash wastes and rad-soaked wastelands. Aberrant storms create torrential acidic rains that eat away at any attempt at life on the continents, while mighty oceans once teeming with life are toxic soups of poison." : undefined}>
            {needsLowercase ? "Vespera Prime, a planet only a few lightyears away from noble Elysia. Once a verdant agriworld thousands of years past, it is now a planet hostile to nearly all life, a casualty from the days of the Horus Heresy. Millennia of war have broken the crust, revealing continents of volcanic activity and rivers of magma. Ancient fields of forest have become ash wastes and rad-soaked wastelands. Aberrant storms create torrential acidic rains that eat away at any attempt at life on the continents, while mighty oceans once teeming with life are toxic soups of poison.".toLowerCase() : "Vespera Prime, a planet only a few lightyears away from noble Elysia. Once a verdant agriworld thousands of years past, it is now a planet hostile to nearly all life, a casualty from the days of the Horus Heresy. Millennia of war have broken the crust, revealing continents of volcanic activity and rivers of magma. Ancient fields of forest have become ash wastes and rad-soaked wastelands. Aberrant storms create torrential acidic rains that eat away at any attempt at life on the continents, while mighty oceans once teeming with life are toxic soups of poison."}
          </p>
          <p style={{ margin: 0 }} data-text={isXenos ? "But where one might see a death world, the Imperium saw opportunity. For the last 4,000 years, the Imperium has created a foothold on the planet, extracting rare minerals and promethium pushed up from the crust. The planet is now a crucial resource station for the endless armies of the Imperium. Several billion inhabitants live in hive cities, working in the manufactorums and helping to extract resources from this dying world." : undefined}>
            {needsLowercase ? "But where one might see a death world, the Imperium saw opportunity. For the last 4,000 years, the Imperium has created a foothold on the planet, extracting rare minerals and promethium pushed up from the crust. The planet is now a crucial resource station for the endless armies of the Imperium. Several billion inhabitants live in hive cities, working in the manufactorums and helping to extract resources from this dying world.".toLowerCase() : "But where one might see a death world, the Imperium saw opportunity. For the last 4,000 years, the Imperium has created a foothold on the planet, extracting rare minerals and promethium pushed up from the crust. The planet is now a crucial resource station for the endless armies of the Imperium. Several billion inhabitants live in hive cities, working in the manufactorums and helping to extract resources from this dying world."}
          </p>
          <p style={{ margin: 0 }} data-text={isXenos ? "Life is harsh for the average Imperial citizen, and many have abandoned the weary hive cities to live in the wastes, finding ancient relics and machines to plunder for some coin. These people have since become nomadic tribes living on the edge of society and forming their own ways of life, eschewing the safety of the walls for relative freedom." : undefined}>
            {needsLowercase ? "Life is harsh for the average Imperial citizen, and many have abandoned the weary hive cities to live in the wastes, finding ancient relics and machines to plunder for some coin. These people have since become nomadic tribes living on the edge of society and forming their own ways of life, eschewing the safety of the walls for relative freedom.".toLowerCase() : "Life is harsh for the average Imperial citizen, and many have abandoned the weary hive cities to live in the wastes, finding ancient relics and machines to plunder for some coin. These people have since become nomadic tribes living on the edge of society and forming their own ways of life, eschewing the safety of the walls for relative freedom."}
          </p>
          <p style={{ margin: 0 }} data-text={isXenos ? "Meanwhile, the magma forges are run by the Adeptus Mechanicus. These enormous structures utilize the immense heat of the forges to run the manufactorums that extract both the precious promethium and other minerals near the surface. No creature can survive here except the augmented or genetically enhanced. Plumes of smoke billow into the sky, and ash chokes nearly every corridor. Those found guilty of crimes in the hive are often sent to work the forges—a grueling death sentence and a cruel method of maintaining order in a hopeless world." : undefined}>
            {needsLowercase ? "Meanwhile, the magma forges are run by the Adeptus Mechanicus. These enormous structures utilize the immense heat of the forges to run the manufactorums that extract both the precious promethium and other minerals near the surface. No creature can survive here except the augmented or genetically enhanced. Plumes of smoke billow into the sky, and ash chokes nearly every corridor. Those found guilty of crimes in the hive are often sent to work the forges—a grueling death sentence and a cruel method of maintaining order in a hopeless world.".toLowerCase() : "Meanwhile, the magma forges are run by the Adeptus Mechanicus. These enormous structures utilize the immense heat of the forges to run the manufactorums that extract both the precious promethium and other minerals near the surface. No creature can survive here except the augmented or genetically enhanced. Plumes of smoke billow into the sky, and ash chokes nearly every corridor. Those found guilty of crimes in the hive are often sent to work the forges—a grueling death sentence and a cruel method of maintaining order in a hopeless world."}
          </p>
          <p style={{ margin: 0 }} data-text={isXenos ? "Yet, there are harsher places to live on this death world. The Sump is an abandoned hive from before the Heresy. The city was one of the first to fall to the traitor legions. Once a gleaming fortress of towers overseeing the entirety of the planet from its tall peaks, it now resembles a series of pockmarked craters, thousands of feet deep. Billions were killed in the bombardment, but there were still millions trapped beneath the craters. Those in the underlevels at the time had hoped that help would come for them and waited out the war. That was over 10,000 years ago." : undefined}>
            {needsLowercase ? "Yet, there are harsher places to live on this death world. The Sump is an abandoned hive from before the Heresy. The city was one of the first to fall to the traitor legions. Once a gleaming fortress of towers overseeing the entirety of the planet from its tall peaks, it now resembles a series of pockmarked craters, thousands of feet deep. Billions were killed in the bombardment, but there were still millions trapped beneath the craters. Those in the underlevels at the time had hoped that help would come for them and waited out the war. That was over 10,000 years ago.".toLowerCase() : "Yet, there are harsher places to live on this death world. The Sump is an abandoned hive from before the Heresy. The city was one of the first to fall to the traitor legions. Once a gleaming fortress of towers overseeing the entirety of the planet from its tall peaks, it now resembles a series of pockmarked craters, thousands of feet deep. Billions were killed in the bombardment, but there were still millions trapped beneath the craters. Those in the underlevels at the time had hoped that help would come for them and waited out the war. That was over 10,000 years ago."}
          </p>
          <div style={{ marginTop: '1rem', color: isXenos ? '#ef4444' : '#16a34a', fontSize: '0.8rem', borderTop: isXenos ? '1px dashed #450a0a' : '1px dashed #1a2e1a', paddingTop: '1rem' }} data-text={isXenos ? "[END TRANSMISSION] // NO REPLIES PERMITTED" : undefined}>
            {needsLowercase ? "[END TRANSMISSION] // NO REPLIES PERMITTED // THE EMPEROR PROTECTS".toLowerCase() : "[END TRANSMISSION] // NO REPLIES PERMITTED // THE EMPEROR PROTECTS"}
          </div>
        </div>
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
            onGlobeClick={({ lat, lng }) => {
              console.log(`Clicked Coordinates:\nLat: ${lat.toFixed(2)}\nLng: ${lng.toFixed(2)}`);
            }}
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
                ${(d.p1Lore || d.p2Lore) ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); max-width: 280px; white-space: normal; display: flex; flex-direction: column; gap: 8px;">
                  <strong style="color: #fff; font-size: 0.85em; text-transform: uppercase; letter-spacing: 1px;">Battle Reports</strong>
                  ${d.p1Lore ? `<div style="font-size: 0.85em;"><strong style="color: ${d.winnerId === d.p1Id ? d.color : '#999'};">${d.p1Name}:</strong> <i style="color: #ccc;">"${d.p1Lore.substring(0, 120)}${d.p1Lore.length > 120 ? '...' : ''}"</i></div>` : ''}
                  ${d.p2Lore ? `<div style="font-size: 0.85em;"><strong style="color: ${d.winnerId === d.p2Id ? d.color : '#999'};">${d.p2Name}:</strong> <i style="color: #ccc;">"${d.p2Lore.substring(0, 120)}${d.p2Lore.length > 120 ? '...' : ''}"</i></div>` : ''}
                </div>` : ''}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTheatre(d);
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

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--theme-border)', paddingBottom: '0.5rem', color: 'var(--theme-accent)' }}>Forces Deployed</h2>
        {sortedFactions.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No forces currently deployed.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {sortedFactions.map(([faction, count]) => (
              <div key={faction} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--theme-bg)', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid var(--theme-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--theme-fg)' }}>{faction}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--theme-fg-muted)' }}>{count} Commander{count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--theme-border)', paddingBottom: '0.5rem', color: 'var(--theme-accent)' }}>Sector Command Roster</h2>
        
        {commanders.length === 0 ? (
          <p style={{ color: 'var(--theme-fg-muted)' }}>No active commanders registered.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {commanders.map(cmd => (
              <div key={cmd.id} style={{ backgroundColor: 'var(--theme-bg-secondary)', borderRadius: '6px', border: '1px solid var(--theme-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid var(--theme-border)', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--theme-bg)', flexShrink: 0, border: '2px solid var(--theme-accent)' }}>
                    {cmd.avatar_url ? (
                      <img src={getTransformUrl(cmd.avatar_url, 120, 60)} alt={cmd.commander_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚔</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: 'var(--theme-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmd.commander_name || 'Classified'}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--theme-accent)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cmd.army_faction || 'Unknown Faction'}
                      {cmd.army_subfaction ? ` - ${cmd.army_subfaction}` : ''}
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '1rem', flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--theme-fg-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {cmd.army_lore ? (
                      `"${cmd.army_lore.substring(0, 150)}${cmd.army_lore.length > 150 ? '...' : ''}"`
                    ) : (
                      "No narrative chronicles recorded for this commander."
                    )}
                  </div>
                </div>
                
                <div style={{ padding: '1rem', paddingTop: 0 }}>
                  <Link to={`/commander/${cmd.id}`} className="btn secondary" style={{ width: '100%', textAlign: 'center', display: 'block', boxSizing: 'border-box' }}>
                    View Full Dossier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theatre Detail Modal */}
      {selectedTheatre && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }} onClick={() => setSelectedTheatre(null)}>
          <div style={{ background: 'var(--theme-bg-secondary)', border: `1px solid ${selectedTheatre.color}`, borderRadius: '8px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedTheatre(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: '1.5rem', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>×</button>
            
            {/* Image header */}
            <div style={{ height: '220px', width: '100%', background: `linear-gradient(to bottom, transparent, var(--theme-bg-secondary)), url(/images/theatres/${selectedTheatre.image || selectedTheatre.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png'}) center/cover, #222`, borderBottom: `2px solid ${selectedTheatre.color}` }}>
              <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'flex-end', padding: '1.5rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                <h3 style={{ margin: 0, fontSize: '2rem', color: selectedTheatre.color, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{selectedTheatre.name}</h3>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <i style={{ color: '#aaa', fontSize: '1rem', display: 'block', marginBottom: '1.5rem' }}>"{selectedTheatre.narrative}"</i>
              
              {selectedTheatre.warlord ? (
                <>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                    {selectedTheatre.avatar && <img src={selectedTheatre.avatar} alt="Warlord" style={{ width: '64px', height: '64px', borderRadius: '4px', border: `1px solid ${selectedTheatre.color}`, objectFit: 'cover' }} />}
                    <div>
                      <span style={{ color: '#ccc', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Controlling Warlord</span>
                      <strong style={{ color: '#fff', display: 'block', fontSize: '1.25rem' }}>{selectedTheatre.warlord}</strong>
                      <span style={{ color: selectedTheatre.color, display: 'block', fontSize: '1rem', fontWeight: 'bold' }}>{selectedTheatre.controllingFaction}</span>
                    </div>
                  </div>
                  
                  {selectedTheatre.lore && (
                    <div style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: '#ccc', lineHeight: 1.6, paddingLeft: '1rem', borderLeft: `2px solid ${selectedTheatre.color}` }}>
                      "{selectedTheatre.lore}"
                    </div>
                  )}

                  {(selectedTheatre.p1Lore || selectedTheatre.p2Lore) && (
                    <div>
                      <h4 style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Battle Reports</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {selectedTheatre.p1Lore && (
                          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                            <strong style={{ color: selectedTheatre.winnerId === selectedTheatre.p1Id ? selectedTheatre.color : '#999', display: 'block', marginBottom: '0.5rem' }}>{selectedTheatre.p1Name}</strong>
                            <div style={{ color: '#ccc', lineHeight: 1.6 }}>"{selectedTheatre.p1Lore}"</div>
                          </div>
                        )}
                        {selectedTheatre.p2Lore && (
                          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                            <strong style={{ color: selectedTheatre.winnerId === selectedTheatre.p2Id ? selectedTheatre.color : '#999', display: 'block', marginBottom: '0.5rem' }}>{selectedTheatre.p2Name}</strong>
                            <div style={{ color: '#ccc', lineHeight: 1.6 }}>"{selectedTheatre.p2Lore}"</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#ccc', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                  Core staging area. No direct warlord control established.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
