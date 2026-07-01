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
}

export interface MatchPair {
  p1: CommanderProfile;
  p2: CommanderProfile;
  score: number;
  theatre_name: string;
}

const getGrandAlliance = (factionName: string) => {
  const faction = FACTIONS.find(f => f.name.toLowerCase() === factionName.toLowerCase());
  return faction ? faction.grandAlliance : null;
};

export function generateMatchups(pool: CommanderProfile[]): MatchPair[] {
  const unresolved = [...pool];
  const matchups: MatchPair[] = [];

  // Shuffle pool to add randomness to tied scores
  unresolved.sort(() => Math.random() - 0.5);

  while (unresolved.length > 1) {
    const p1 = unresolved.pop()!;
    const p1Alliance = getGrandAlliance(p1.army_faction || '');
    
    let bestMatchIndex = -1;
    let highestScore = -9999;

    for (let i = 0; i < unresolved.length; i++) {
      const p2 = unresolved[i];
      const p2Alliance = getGrandAlliance(p2.army_faction || '');
      let matchScore = 0;

      // Strict Ban 1: Imperium vs Imperium
      if (p1Alliance === 'Imperium' && p2Alliance === 'Imperium') {
        continue;
      }

      // Strict Ban 2: Xenos vs exact same Xenos faction
      if (p1Alliance === 'Xenos' && p2Alliance === 'Xenos') {
        if (p1.army_faction && p2.army_faction && p1.army_faction.toLowerCase() === p2.army_faction.toLowerCase()) {
          continue;
        }
      }

      // Rule 0: Chaos alignment preference (Chaos vs Chaos is allowed but penalized)
      if (p1Alliance === 'Chaos' && p2Alliance === 'Chaos') {
        matchScore -= 15;
      }

      // Rule 1: Theatre Proximity (+50 points)
      if (p1.deployed_theatre && p2.deployed_theatre && p1.deployed_theatre === p2.deployed_theatre) {
        matchScore += 50;
      }
      
      // Rule 1.5: Exact Location Proximity (+100 points)
      if (p1.deployed_location_id && p2.deployed_location_id && p1.deployed_location_id === p2.deployed_location_id) {
        matchScore += 100;
      }

      // Rule 2: Attacker vs Defender (+20 points)
      if ((p1Alliance === 'Imperium' && (p2Alliance === 'Chaos' || p2Alliance === 'Xenos')) ||
          (p2Alliance === 'Imperium' && (p1Alliance === 'Chaos' || p1Alliance === 'Xenos'))) {
        matchScore += 20;
      }

      // Rule 3: Location (+10 points)
      if (p1.location && p2.location && p1.location.toLowerCase() === p2.location.toLowerCase()) {
        matchScore += 10;
      }

      // Rule 4: Experience Tier (+5 points)
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
      const subSector = sectors[matchups.length % sectors.length];
      
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
