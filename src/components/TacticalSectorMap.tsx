import { useState } from 'react';
import { FACTIONS } from '../data/warhammer40k';

// ─── Faction Color Helper ────────────────────────────────────────────────────

export function getGrandAlliance(factionName?: string): 'Imperium' | 'Chaos' | 'Xenos' {
  if (!factionName) return 'Imperium';
  const found = FACTIONS.find(f => f.name === factionName);
  if (found?.grandAlliance) {
    const ga = found.grandAlliance.toLowerCase();
    if (ga === 'chaos') return 'Chaos';
    if (ga === 'xenos') return 'Xenos';
    return 'Imperium';
  }
  const lower = factionName.toLowerCase();
  if (lower.includes('chaos') || lower.includes('daemon') || lower.includes('thousand sons') || lower.includes('death guard') || lower.includes('world eaters')) return 'Chaos';
  if (lower.includes('ork') || lower.includes('tau') || lower.includes("t'au") || lower.includes('necron') || lower.includes('tyranid') || lower.includes('aeldari') || lower.includes('drukhari') || lower.includes('votann') || lower.includes('genestealer')) return 'Xenos';
  return 'Imperium';
}

export function getFactionColor(factionName?: string, grandAlliance?: string): string {
  if (!factionName) return '#4b5563';
  if (!grandAlliance) {
    const found = FACTIONS.find(f => f.name === factionName);
    grandAlliance = found?.grandAlliance;
  }
  if (grandAlliance?.toLowerCase() === 'imperium') return '#3b82f6';
  if (grandAlliance?.toLowerCase() === 'chaos') return '#ef4444';
  switch (factionName) {
    case 'Orks': return '#22c55e';
    case 'Necrons': return '#10b981';
    case 'Tyranids': return '#a855f7';
    case "T'au Empire": return '#f97316';
    case 'Aeldari': return '#06b6d4';
    case 'Drukhari': return '#14b8a6';
    case 'Leagues of Votann': return '#eab308';
    case 'Genestealer Cults': return '#d946ef';
    default: return '#10b981';
  }
}

export function getFactionNarrativeGoal(factionName?: string, result: 'win' | 'tie' | 'loss' = 'win'): string {
  if (!factionName) return result === 'win' ? 'Strategic Victory' : (result === 'tie' ? 'Contested Ground' : 'Tactical Retreat');
  const lower = factionName.toLowerCase();
  
  if (lower.includes('ork')) {
    return result === 'win' ? 'Sector Wrecked & Looted' : (result === 'tie' ? 'Bloody Brawling' : 'Warband Repelled');
  }
  if (lower.includes('chaos') || lower.includes('daemon') || lower.includes('thousand sons') || lower.includes('death guard') || lower.includes('world eaters')) {
    return result === 'win' ? 'Dark Ritual Completed' : (result === 'tie' ? 'Warp Corruption Spreading' : 'Ritual Disrupted');
  }
  if (lower.includes('astartes') || lower.includes('space marine') || lower.includes('imperium') || lower.includes('guard') || lower.includes('militarum') || lower.includes('mechanicus') || lower.includes('sororitas') || lower.includes('custodes')) {
    return result === 'win' ? 'Sector Secured & Fortified' : (result === 'tie' ? 'Stalemate at Perimeter' : 'Defensive Line Breached');
  }
  if (lower.includes("t'au") || lower.includes('tau')) {
    return result === 'win' ? 'Annexed for the Greater Good' : (result === 'tie' ? 'Tactical Standoff' : 'Expansion Halted');
  }
  if (lower.includes('necron')) {
    return result === 'win' ? 'Tomb Complex Awakened' : (result === 'tie' ? 'Intruders Contained' : 'Stasis Re-engaged');
  }
  if (lower.includes('tyranid')) {
    return result === 'win' ? 'Biomass Harvested' : (result === 'tie' ? 'Feeder Tendrils Engaged' : 'Swarm Repelled');
  }
  if (lower.includes('aeldari') || lower.includes('eldar') || lower.includes('drukhari') || lower.includes('harlequin')) {
    return result === 'win' ? 'Webway Gate Secured' : (result === 'tie' ? 'Fates Entangled' : 'Strategic Retreat');
  }
  if (lower.includes('votann') || lower.includes('leagues')) {
    return result === 'win' ? 'Resource Claim Secured' : (result === 'tie' ? 'Prospecting Contested' : 'Mining Operations Halted');
  }
  if (lower.includes('genestealer')) {
    return result === 'win' ? 'Uprising Triggered' : (result === 'tie' ? 'Subterranean Infiltration' : 'Cell Suppressed');
  }
  
  return result === 'win' ? 'Strategic Victory' : (result === 'tie' ? 'Contested Ground' : 'Tactical Retreat');
}

// ─── Sector Definitions ──────────────────────────────────────────────────────
// 5 sectors per theatre representing the 5 escalation rounds (400 to 2000 pts).
// Each theatre features a distinctive landmass / fortress silhouette centered on
// the Auspex tactical holoplot, surrounded by targeting grids and coordinates.

interface SectorDef {
  id: number;
  name: string;
  pointsLevel: number;
  points: string;
  cx: number;
  cy: number;
}

const THEATRE_SECTORS: Record<string, SectorDef[]> = {

  // ── Pyramidal Spire Fortress — tiered stronghold ascending to the apex
  'The Hive Spires': [
    { id: 0, name: 'Outer Wall',       pointsLevel: 400,  points: '100,450 700,450 640,380 160,380', cx: 400, cy: 415 },
    { id: 1, name: 'Hab Districts',    pointsLevel: 800,  points: '180,375 620,375 560,290 240,290', cx: 400, cy: 332 },
    { id: 2, name: 'Merchant Quarter', pointsLevel: 1200, points: '260,285 540,285 490,200 310,200', cx: 400, cy: 242 },
    { id: 3, name: 'Administratum',    pointsLevel: 1600, points: '325,195 475,195 440,110 360,110', cx: 400, cy: 152 },
    { id: 4, name: 'Spire Apex',       pointsLevel: 2000, points: '370,105 430,105 400,30',          cx: 400, cy: 80 },
  ],

  // ── Sprawling Canyon Island — irregular perimeter enclosing a dead zone stronghold
  'The Ash Wastes': [
    { id: 0, name: 'Rad Perimeter',    pointsLevel: 400,  points: '80,380 220,440 400,450 350,360 200,350 120,280', cx: 230, cy: 380 },
    { id: 1, name: 'Nomad Trail',      pointsLevel: 800,  points: '410,450 700,400 640,320 450,340 360,365',          cx: 510, cy: 385 },
    { id: 2, name: 'Storm Corridor',   pointsLevel: 1200, points: '650,310 740,220 660,130 520,180 540,280',          cx: 620, cy: 220 },
    { id: 3, name: 'Scavenger Dens',   pointsLevel: 1600, points: '500,170 640,120 450,60 300,100 380,200',           cx: 450, cy: 130 },
    { id: 4, name: 'Dead Zone',        pointsLevel: 2000, points: '220,340 350,350 370,210 280,110 140,200',          cx: 270, cy: 240 },
  ],

  // ── Heavy Industrial Refinery — angular octagonal blast-door layout
  'The Magma Forges': [
    { id: 0, name: 'Cooling Vents',    pointsLevel: 400,  points: '100,200 240,140 240,360 100,300', cx: 170, cy: 250 },
    { id: 1, name: 'Extraction Bay',   pointsLevel: 800,  points: '560,140 700,200 700,300 560,360', cx: 630, cy: 250 },
    { id: 2, name: 'Foundry Floor',    pointsLevel: 1200, points: '250,370 550,370 480,460 320,460', cx: 400, cy: 415 },
    { id: 3, name: 'Slag Channels',    pointsLevel: 1600, points: '320,40 480,40 550,130 250,130',   cx: 400, cy: 85 },
    { id: 4, name: 'Forge Core',       pointsLevel: 2000, points: '260,150 540,150 540,350 260,350', cx: 400, cy: 250 },
  ],

  // ── Orbital Star Hub — concentric platforms radiating around a command core
  'Orbital Relay Station': [
    { id: 0, name: 'Docking Pylons',   pointsLevel: 400,  points: '120,80 320,120 260,220 100,160',  cx: 200, cy: 145 },
    { id: 1, name: 'Comms Array',      pointsLevel: 800,  points: '480,120 680,80 700,160 540,220',  cx: 600, cy: 145 },
    { id: 2, name: 'Weapons Battery',  pointsLevel: 1200, points: '540,280 700,340 660,420 480,380', cx: 595, cy: 355 },
    { id: 3, name: 'Engineering Deck', pointsLevel: 1600, points: '260,280 320,380 140,420 100,340', cx: 205, cy: 355 },
    { id: 4, name: 'Command Bridge',   pointsLevel: 2000, points: '340,180 460,180 500,250 460,320 340,320 300,250', cx: 400, cy: 250 },
  ],

  // ── Shattered Crater — jagged fragmented shards surrounding an impact epicenter
  'The Sump Ruins': [
    { id: 0, name: 'Crater Rim',       pointsLevel: 400,  points: '80,150 240,180 200,350 100,400 60,280',     cx: 140, cy: 270 },
    { id: 1, name: 'Outer Ruins',      pointsLevel: 800,  points: '220,370 560,420 640,450 360,470 120,420', cx: 380, cy: 425 },
    { id: 2, name: 'Collapsed Tunnels',pointsLevel: 1200, points: '580,390 740,320 700,160 560,200 520,300', cx: 620, cy: 270 },
    { id: 3, name: 'Warp Fissure',     pointsLevel: 1600, points: '260,160 540,180 660,140 450,60 200,80',    cx: 420, cy: 125 },
    { id: 4, name: 'Buried Tomb',      pointsLevel: 2000, points: '260,190 520,210 500,360 220,340',          cx: 375, cy: 275 },
  ],

  // ── Offshore Archipelago — connected deep sea platforms
  'The Toxic Oceans': [
    { id: 0, name: 'Shore Batteries',  pointsLevel: 400,  points: '60,160 200,160 220,340 80,360',   cx: 140, cy: 260 },
    { id: 1, name: 'Tidal Zone',       pointsLevel: 800,  points: '240,100 400,120 380,240 220,200', cx: 310, cy: 165 },
    { id: 2, name: 'Deep Channels',    pointsLevel: 1200, points: '240,360 440,380 420,460 260,440', cx: 340, cy: 410 },
    { id: 3, name: 'Leviathan Depths', pointsLevel: 1600, points: '460,220 640,180 680,340 460,360', cx: 560, cy: 275 },
    { id: 4, name: 'Abyssal Trench',   pointsLevel: 2000, points: '680,150 780,200 760,320 660,380', cx: 720, cy: 260 },
  ],
};

// Generic fallback — distinct pentagonal fortress layout
const DEFAULT_SECTORS: SectorDef[] = [
  { id: 0, name: 'Sector Alpha',   pointsLevel: 400,  points: '150,380 300,440 500,440 650,380 550,300 250,300', cx: 400, cy: 370 },
  { id: 1, name: 'Sector Beta',    pointsLevel: 800,  points: '120,180 240,290 200,370 80,280', cx: 160, cy: 280 },
  { id: 2, name: 'Sector Gamma',   pointsLevel: 1200, points: '680,180 720,280 600,370 560,290', cx: 640, cy: 280 },
  { id: 3, name: 'Sector Delta',   pointsLevel: 1600, points: '260,100 540,100 660,170 550,290 250,290 140,170', cx: 400, cy: 185 },
  { id: 4, name: 'Sector Epsilon', pointsLevel: 2000, points: '320,200 480,200 500,270 300,270', cx: 400, cy: 235 },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface TacticalSectorMapProps {
  theatre: { name: string; narrative: string; color: string };
  commanders: any[];
  mapLocations: any[];
  matchups?: any[];
}

export default function TacticalSectorMap({ theatre, commanders, matchups }: TacticalSectorMapProps) {
  const [selectedSector, setSelectedSector] = useState<number | null>(null);

  const deployedCommanders = commanders.filter(c => c.deployed_theatre === theatre.name);
  const sectors = THEATRE_SECTORS[theatre.name] || DEFAULT_SECTORS;

  const getSectorForCommander = (cmdId: string) => {
    let hash = 0;
    for (let i = 0; i < cmdId.length; i++) hash = ((hash << 5) - hash) + cmdId.charCodeAt(i);
    return Math.abs(hash) % sectors.length;
  };

  const getSectorControl = (sectorId: number) => {
    const sectorCmds = deployedCommanders.filter(c => getSectorForCommander(c.id) === sectorId);
    if (sectorCmds.length === 0) return { faction: null, color: '#4b5563', status: 'UNCONTESTED', count: 0, commanders: [] };

    const factionCounts: Record<string, number> = {};
    sectorCmds.forEach(c => {
      const f = c.army_faction || 'Unknown';
      factionCounts[f] = (factionCounts[f] || 0) + 1;
    });
    let topFaction = '';
    let maxCount = -1;
    Object.entries(factionCounts).forEach(([f, count]) => {
      if (count > maxCount) { maxCount = count; topFaction = f; }
    });

    return {
      faction: topFaction,
      color: getFactionColor(topFaction),
      status: `CONTROLLED BY ${topFaction.toUpperCase()}`,
      count: sectorCmds.length,
      commanders: sectorCmds
    };
  };

  const handleSectorTap = (sectorId: number) => {
    setSelectedSector(prev => prev === sectorId ? null : sectorId);
  };

  const activeSector = selectedSector !== null
    ? { sector: sectors[selectedSector], control: getSectorControl(selectedSector) }
    : null;

  return (
    <div style={{
      position: 'relative', width: '100%',
      backgroundColor: '#070a12',
      borderRadius: '8px',
      border: `2px solid ${theatre.color}`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.9), inset 0 0 50px rgba(0,0,0,0.8), 0 0 15px ${theatre.color}30`,
      overflow: 'hidden',
      fontFamily: 'var(--font-head, monospace)'
    }}>
      {/* CRT Scanlines & Radar Sweep Animation */}
      <style>
        {`
          @keyframes radarSweep {
            0% { transform: translateY(-100%); }
            50% { transform: translateY(500px); }
            100% { transform: translateY(-100%); }
          }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}
      </style>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        pointerEvents: 'none', zIndex: 10
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '80px',
        background: `linear-gradient(180deg, transparent, ${theatre.color}15, transparent)`,
        animation: 'radarSweep 8s infinite linear',
        pointerEvents: 'none', zIndex: 9
      }} />

      {/* Header Bar */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px',
        color: theatre.color, fontSize: 'clamp(0.55rem, 1.8vw, 0.75rem)', letterSpacing: '1.5px',
        borderBottom: `1px solid ${theatre.color}50`,
        background: 'rgba(0,0,0,0.7)',
        position: 'relative', zIndex: 5,
        textShadow: `0 0 8px ${theatre.color}`
      }}>
        <span>AUSPEX TACTICAL DISPLAY // {theatre.name.toUpperCase()}</span>
        <span style={{ opacity: 0.8, animation: 'pulseGlow 2s infinite' }}>● ACTIVE WAR ZONE (5 ROUNDS)</span>
      </div>

      {/* Tactical Map Canvas */}
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block', background: 'radial-gradient(circle at center, #111827 0%, #070a12 80%)' }}>

        <defs>
          <filter id="sectorGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background Grid & Targeting Rings */}
        <rect width="800" height="500" fill="url(#tacticalGrid)" />
        <circle cx="400" cy="250" r="220" fill="none" stroke={theatre.color} strokeWidth="1" strokeDasharray="4 8" opacity="0.2" />
        <circle cx="400" cy="250" r="140" fill="none" stroke={theatre.color} strokeWidth="1" strokeDasharray="2 4" opacity="0.15" />
        <line x1="0" y1="250" x2="800" y2="250" stroke={theatre.color} strokeWidth="1" opacity="0.15" />
        <line x1="400" y1="0" x2="400" y2="500" stroke={theatre.color} strokeWidth="1" opacity="0.15" />

        {/* Corner Targeting Brackets */}
        <path d="M 20,50 L 20,20 L 50,20" fill="none" stroke={theatre.color} strokeWidth="2" opacity="0.6" />
        <path d="M 780,50 L 780,20 L 750,20" fill="none" stroke={theatre.color} strokeWidth="2" opacity="0.6" />
        <path d="M 20,450 L 20,480 L 50,480" fill="none" stroke={theatre.color} strokeWidth="2" opacity="0.6" />
        <path d="M 780,450 L 780,480 L 750,480" fill="none" stroke={theatre.color} strokeWidth="2" opacity="0.6" />

        {/* Escalation Progression Vectors (Links between rounds 1->2->3->4->5) */}
        {sectors.slice(0, -1).map((sec, idx) => {
          const nextSec = sectors[idx + 1];
          return (
            <line key={`link-${idx}`} x1={sec.cx} y1={sec.cy} x2={nextSec.cx} y2={nextSec.cy}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
          );
        })}

        {/* Render Sectors */}
        {sectors.map(sec => {
          const control = getSectorControl(sec.id);
          const isSelected = selectedSector === sec.id;

          return (
            <g key={sec.id}
               onClick={() => handleSectorTap(sec.id)}
               onMouseEnter={() => { if (selectedSector === null) setSelectedSector(sec.id); }}
               style={{ cursor: 'pointer' }}
               role="button"
               aria-label={`${sec.name} sector`}>

              {/* Glowing silhouette layer */}
              <polygon
                points={sec.points}
                fill={control.color}
                fillOpacity={isSelected ? 0.45 : 0.2}
                stroke={isSelected ? '#ffffff' : control.color}
                strokeWidth={isSelected ? 3 : 1.5}
                filter="url(#sectorGlow)"
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Inner wireframe contour for topographic feel */}
              <polyline
                points={`${sec.points} ${sec.points.trim().split(/\s+/)[0]}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                opacity={isSelected ? 0.8 : 0.3}
                transform={`translate(${sec.cx * 0.05}, ${sec.cy * 0.05}) scale(0.95)`}
                style={{ transformOrigin: `${sec.cx}px ${sec.cy}px` }}
              />

              {/* Commander node indicator pin if forces present */}
              {control.count > 0 && (
                <circle cx={sec.cx} cy={sec.cy - 24} r="5" fill={control.color} stroke="#ffffff" strokeWidth="1.5" />
              )}

              {/* Round / Points label */}
              <text x={sec.cx} y={sec.cy - 10} fill={control.color} fontSize="9"
                    textAnchor="middle" letterSpacing="1.5" fontWeight="bold"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                RND {sec.id + 1} // {sec.pointsLevel} PTS
              </text>
              {/* Sector name */}
              <text x={sec.cx} y={sec.cy + 5} fill="#ffffff" fontSize="12" fontWeight="bold"
                    textAnchor="middle" letterSpacing="0.5"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                {sec.name}
              </text>
              {/* Controlling faction */}
              <text x={sec.cx} y={sec.cy + 19} fill={control.color} fontSize="9"
                    textAnchor="middle" opacity={0.9} fontWeight="bold"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                {control.faction || 'NEUTRAL'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Sector Detail — below the map */}
      {activeSector ? (
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${activeSector.control.color}`,
          background: 'rgba(11,15,25,0.95)',
          color: '#ffffff', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
          position: 'relative', zIndex: 5,
          display: 'flex', flexWrap: 'wrap', gap: '6px 20px', alignItems: 'baseline',
          boxShadow: '0 -4px 15px rgba(0,0,0,0.5)'
        }}>
          <span style={{ color: activeSector.control.color, fontWeight: 'bold', fontSize: '0.95rem' }}>
            RND {activeSector.sector.id + 1} — {activeSector.sector.name.toUpperCase()} ({activeSector.sector.pointsLevel} PTS)
          </span>
          <span>
            <span style={{ color: '#94a3b8' }}>DOMINANCE: </span>
            <span style={{ color: activeSector.control.color, fontWeight: 'bold' }}>{activeSector.control.status}</span>
          </span>
          <span>
            <span style={{ color: '#94a3b8' }}>FORCES DEPLOYED: </span>
            {activeSector.control.count} Commander(s)
          </span>
          {activeSector.control.commanders.length > 0 && (
            <div style={{ width: '100%', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.15)', display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
              {activeSector.control.commanders.map((c: any) => (
                <span key={c.id} style={{ fontSize: '0.8rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', borderLeft: `3px solid ${getFactionColor(c.army_faction)}` }}>
                  ▸ {c.commander_name} ({c.army_faction})
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          padding: '12px 16px', textAlign: 'center',
          color: '#94a3b8', fontSize: 'clamp(0.65rem, 2vw, 0.8rem)',
          borderTop: `1px solid ${theatre.color}30`,
          background: 'rgba(11,15,25,0.8)',
          position: 'relative', zIndex: 5, letterSpacing: '1px'
        }}>
          TAP A SECTOR TO VIEW TACTICAL TELEMETRY
        </div>
      )}

      {/* Active Deployments & Matchups Roster */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${theatre.color || '#3b82f6'}40`,
        background: 'rgba(7,10,18,0.95)',
        color: '#ffffff',
        position: 'relative', zIndex: 5
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: theatre.color || '#3b82f6', letterSpacing: '1.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>ACTIVE DEPLOYMENTS & MATCHUPS</span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal' }}>// THEATRE WARFARE LOG</span>
        </div>

        {deployedCommanders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Imperium', 'Chaos', 'Xenos'].map((alliance) => {
              const group = deployedCommanders.filter((c: any) => getGrandAlliance(c.army_faction) === alliance);
              const headerColor = '#cbd5e1';
              const headerLabel = alliance === 'Imperium' ? 'Imperial Forces' : `${alliance} Forces`;

              return (
                <div key={alliance}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: headerColor, marginBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '2px' }}>
                    {headerLabel} ({group.length})
                  </div>
                  {group.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                      {group.map((c: any) => {
                        const activeMatch = matchups?.find((m: any) => {
                          const isOngoing = m.status !== 'completed' && !m.game_result;
                          return isOngoing && (m.p1_id === c.id || m.p2_id === c.id);
                        });

                        let opponentText = 'Awaiting Opponent Assignment';
                        if (activeMatch) {
                          const isP1 = activeMatch.p1_id === c.id;
                          const oppProfile = isP1 ? activeMatch.p2_profile : activeMatch.p1_profile;
                          const opp = Array.isArray(oppProfile) ? oppProfile[0] : oppProfile;
                          if (opp) {
                            opponentText = `VS ${opp.commander_name || 'Commander'} (${opp.army_faction || 'Enemy Faction'})`;
                          }
                        }

                        return (
                          <div key={c.id} style={{
                            padding: '8px 10px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderLeft: `4px solid ${getFactionColor(c.army_faction)}`,
                            borderRadius: '4px',
                            display: 'flex', flexDirection: 'column', gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#f8fafc' }}>{c.commander_name}</span>
                              <span style={{ fontSize: '0.7rem', color: getFactionColor(c.army_faction) }}>{c.army_faction}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: activeMatch ? '#fbbf24' : '#64748b', fontWeight: activeMatch ? 'bold' : 'normal' }}>
                              {opponentText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                      No {alliance} forces currently stationed in this sector.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
            No commanders currently stationed in this sector.
          </div>
        )}
      </div>
    </div>
  );
}
