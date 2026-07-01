/**
 * Matchmaker Engine calculating Campaign Pairings based on User Parameters.
 * 
 * Strict Bans:
 * 1. No Imperium vs Imperium.
 * 2. No Xenos vs exact same Xenos faction (e.g. Tyranids vs Tyranids is banned, but Tyranids vs Orks is allowed).
 * 
 * Priorities & Penalties:
 * 1. Matching Exact Location (+100 points)
 * 2. Matching Theatre (+50 points)
 * 3. Attacker vs Defender (+20 points)
 * 4. Matching Location (+10 points)
 * 5. Matching Experience Tier (+5 points)
 * 6. Chaos vs Chaos (-15 points penalty so Chaos aligns against others when possible)
 */

import { FACTIONS } from '../../data/warhammer40k';

export interface CommanderProfile {
  id: string;
  location: string;
  experience_level: string;
  army_faction: string;
  commander_name: string;
  deployed_theatre?: string;
  deployed_location_id?: string;
  preferred_store_id?: string;
}

export interface MatchPair {
  p1: CommanderProfile;
  p2: CommanderProfile;
  score: number;
  theatre_name: string;
}

const getAlliance = (factionName: string) => {
  const faction = FACTIONS.find(f => f.name.toLowerCase() === factionName.toLowerCase());
  return faction ? faction.grandAlliance : null;
};

const checkLocationSynergy = (p1: CommanderProfile, p2: CommanderProfile): boolean => {
  if (p1.preferred_store_id && p2.preferred_store_id && p1.preferred_store_id === p2.preferred_store_id) return true;
  if (p1.deployed_location_id && p2.deployed_location_id && p1.deployed_location_id === p2.deployed_location_id) return true;
  if (p1.deployed_theatre && p2.deployed_theatre && p1.deployed_theatre === p2.deployed_theatre && p1.deployed_theatre !== 'The Ash Wastes') return true;
  if (p1.location && p2.location) {
    const l1 = p1.location.trim().toLowerCase();
    const l2 = p2.location.trim().toLowerCase();
    if (l1 === l2 && l1 !== '') return true;
    
    const zips1: string[] = l1.match(/\b\d{5}\b/g) || [];
    const zips2: string[] = l2.match(/\b\d{5}\b/g) || [];
    if (zips1.some((z: string) => zips2.includes(z))) return true;

    const parts1 = l1.split(/[\s,]+/).filter(p => p.length >= 4 && !/^\d+$/.test(p));
    const parts2 = l2.split(/[\s,]+/).filter(p => p.length >= 4 && !/^\d+$/.test(p));
    if (parts1.some(p => l2.includes(p)) || parts2.some(p => l1.includes(p))) return true;
  }
  return false;
};

export function generateMatchups(pool: CommanderProfile[], currentMonth: number = 1): MatchPair[] {
  const unresolved = [...pool];
  const matchups: MatchPair[] = [];

  // Shuffle pool to add randomness to tied scores
  unresolved.sort(() => Math.random() - 0.5);

  while (unresolved.length > 1) {
    const p1 = unresolved.shift()!;
    let bestMatchIndex = -1;
    let highestScore = -1;

    for (let i = 0; i < unresolved.length; i++) {
      const p2 = unresolved[i];

      // Alliance Logic
      const a1 = getAlliance(p1.army_faction);
      const a2 = getAlliance(p2.army_faction);

      // STRICT BAN: Imperium vs Imperium is strictly forbidden
      if (a1 === 'Imperium' && a2 === 'Imperium') {
        continue;
      }

      // STRICT BAN: Exact same Xenos faction is strictly forbidden (e.g. Tyranids vs Tyranids)
      if (a1 === 'Xenos' && a2 === 'Xenos' && p1.army_faction === p2.army_faction) {
        continue;
      }

      let matchScore = 0;

      // Chaos vs Chaos penalty: allowed, but heavily penalized so Chaos vs non-Chaos is preferred
      if (a1 === 'Chaos' && a2 === 'Chaos') {
        matchScore -= 50;
      }

      // Geospatial proximity priority: From round 2 onwards (+100 pts) based on location preferences
      if (currentMonth > 1 && checkLocationSynergy(p1, p2)) {
        matchScore += 100;
      } else if (p1.location && p2.location && p1.location.trim().toLowerCase() === p2.location.trim().toLowerCase()) {
        matchScore += 10;
      }

      // Narrative pairing: Attacker vs Defender bonus (Imperium vs non-Imperium)
      if ((a1 === 'Imperium' && a2 !== 'Imperium') || (a1 !== 'Imperium' && a2 === 'Imperium')) {
        matchScore += 20;
      }

      // Experience level parity
      if (p1.experience_level === p2.experience_level) {
        matchScore += 5;
      }

      if (matchScore > highestScore) {
        highestScore = matchScore;
        bestMatchIndex = i;
      }
    }

    if (bestMatchIndex !== -1) {
      const p2 = unresolved.splice(bestMatchIndex, 1)[0];
      
      const REAL_THEATRE_SECTORS: Record<string, string[]> = {
        'The Hive Spires': ['Outer Wall', 'Hab Districts', 'Merchant Quarter', 'Administratum', 'Spire Apex'],
        'The Ash Wastes': ['Rad Perimeter', 'Nomad Trail', 'Storm Corridor', 'Scavenger Dens', 'Dead Zone'],
        'The Magma Forges': ['Cooling Vents', 'Extraction Bay', 'Foundry Floor', 'Slag Channels', 'Forge Core'],
        'Orbital Relay Station': ['Docking Pylons', 'Comms Array', 'Weapons Battery', 'Engineering Deck', 'Command Bridge'],
        'The Sump Ruins': ['Crater Rim', 'Outer Ruins', 'Collapsed Tunnels', 'Warp Fissure', 'Buried Tomb'],
        'The Toxic Oceans': ['Shore Batteries', 'Tidal Zone', 'Deep Channels', 'Leviathan Depths', 'Abyssal Trench']
      };

      const theatreKeys = Object.keys(REAL_THEATRE_SECTORS);
      let baseTheatre: string;
      
      // If both players explicitly selected the same non-default theatre, honor it; otherwise distribute across all theatres
      if (p1.deployed_theatre && p2.deployed_theatre && p1.deployed_theatre === p2.deployed_theatre && p1.deployed_theatre !== 'The Ash Wastes' && REAL_THEATRE_SECTORS[p1.deployed_theatre]) {
        baseTheatre = p1.deployed_theatre;
      } else {
        baseTheatre = theatreKeys[matchups.length % theatreKeys.length];
      }

      const sectors = REAL_THEATRE_SECTORS[baseTheatre];
      const sectorIndex = Math.min(Math.max(1, currentMonth), sectors.length) - 1;
      const subSector = sectors[sectorIndex];
      
      matchups.push({ p1, p2, score: highestScore, theatre_name: `${baseTheatre} - ${subSector}` });
    } else {
      // Could not find any valid match for p1 based on strict bans.
      // In a real scenario, they would get a Bye or we'd loosen restrictions.
      // For this system, we'll put them back or leave them out.
      // Since it's while loop, we just ignore p1 for now (effectively a Bye).
    }
  }

  return matchups;
}
