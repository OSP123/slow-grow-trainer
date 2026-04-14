import { describe, it, expect } from 'vitest';
import { generateMatchups, type CommanderProfile } from './Matchmaker';

describe('Matchmaker Simulation Algorithm Engine', () => {
  it('correctly maps players with perfect synergy granting max score (18)', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P1' },
      { id: '2', location: 'Seattle', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P2' },
    ];
    
    const results = generateMatchups(pool);
    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(18); // 10 (location) + 5 (exp) + 3 (different faction)
  });

  it('correctly prioritizes tighter geographic groupings over differing parameters', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'Target Player' },
      { id: '2', location: 'New York', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'Weaker Geospatial Match' }, // Score: 0 + 5 + 3 = 8
      { id: '3', location: 'Seattle', experience_level: 'expert', army_faction: 'Orks', commander_name: 'Strong Geospatial Match' }, // Score: 10 + 0 + 0 = 10
    ];
    
    // Player 1 and Player 3 should be matched definitively.
    const results = generateMatchups(pool);
    // Since unresolved order mutates based on sort(), we can assert the strongest pair was built
    const highestScoreMatch = results.find(r => r.score === 10);
    expect(highestScoreMatch).toBeDefined();
    
    // Determine player ID array inside that matched pair
    const pairedIDs = [highestScoreMatch!.p1.id, highestScoreMatch!.p2.id];
    expect(pairedIDs).toContain('1');
    expect(pairedIDs).toContain('3');
  });

  it('gracefully leaves an odd player unmatched as a BYE', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P1' },
      { id: '2', location: 'Seattle', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P2' },
      { id: '3', location: 'Seattle', experience_level: 'beginner', army_faction: 'Tyranids', commander_name: 'P3' }, // Will be implicitly bypassed or rotated out.
    ];

    const results = generateMatchups(pool);
    expect(results).toHaveLength(1); // 3 players / 2 = 1 Match pair.
  });
});
