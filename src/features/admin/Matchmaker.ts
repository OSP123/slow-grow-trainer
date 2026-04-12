/**
 * Matchmaker Engine calculating Campaign Pairings based on User Parameters.
 * 
 * Priorities:
 * 1. Matching Location (String match)
 * 2. Matching Experience Tier (Beginner | Intermediate | Experienced)
 * 3. Differing Factions
 */

export interface CommanderProfile {
  id: string;
  location: string;
  experience_level: string;
  army_faction: string;
  commander_name: string;
}

export interface MatchPair {
  p1: CommanderProfile;
  p2: CommanderProfile;
  score: number;
}

export function generateMatchups(pool: CommanderProfile[]): MatchPair[] {
  const unresolved = [...pool];
  const matchups: MatchPair[] = [];

  // Shuffle pool to add randomness to tied scores
  unresolved.sort(() => Math.random() - 0.5);

  while (unresolved.length > 1) {
    const p1 = unresolved.pop()!;
    
    let bestMatchIndex = -1;
    let highestScore = -1;

    for (let i = 0; i < unresolved.length; i++) {
      const p2 = unresolved[i];
      let matchScore = 0;

      // Rule 1: Location (+10 points)
      if (p1.location && p2.location && p1.location.toLowerCase() === p2.location.toLowerCase()) {
        matchScore += 10;
      }

      // Rule 2: Experience Tier (+5 points)
      if (p1.experience_level === p2.experience_level) {
        matchScore += 5;
      }

      // Rule 3: Differing Faction (+3 points)
      if (p1.army_faction && p2.army_faction && p1.army_faction.toLowerCase() !== p2.army_faction.toLowerCase()) {
        matchScore += 3;
      }

      if (matchScore > highestScore) {
        highestScore = matchScore;
        bestMatchIndex = i;
      }
    }

    if (bestMatchIndex !== -1) {
      const p2 = unresolved.splice(bestMatchIndex, 1)[0];
      matchups.push({ p1, p2, score: highestScore });
    }
  }

  // If one player remains due to uneven numbers, they receive a Bye (Not fully logged to DB natively yet)
  return matchups;
}
