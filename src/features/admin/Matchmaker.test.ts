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
    expect(results[0].score).toBe(35); // 10 (location) + 5 (exp) + 20 (attacker vs defender)
  });

  it('correctly prioritizes tighter geographic groupings over differing parameters', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'Target Player' },
      { id: '2', location: 'New York', experience_level: 'beginner', army_faction: 'Tyranids', commander_name: 'Weaker Geospatial Match' },
      { id: '3', location: 'Seattle', experience_level: 'expert', army_faction: 'Tyranids', commander_name: 'Strong Geospatial Match' },
    ];
    
    const originalRandom = Math.random;
    Math.random = () => 0.99;
    
    const results = generateMatchups(pool);
    
    Math.random = originalRandom;
    const highestScoreMatch = results.find(r => r.score === 30); // 10 (loc) + 20 (attacker vs defender)
    expect(highestScoreMatch).toBeDefined();
    
    const pairedIDs = [highestScoreMatch!.p1.id, highestScoreMatch!.p2.id];
    expect(pairedIDs).toContain('1');
    expect(pairedIDs).toContain('3');
  });

  it('gracefully leaves an odd player unmatched as a BYE', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P1' },
      { id: '2', location: 'Seattle', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P2' },
      { id: '3', location: 'Seattle', experience_level: 'beginner', army_faction: 'Chaos Space Marines', commander_name: 'P3' },
    ];

    const results = generateMatchups(pool);
    expect(results).toHaveLength(1);
  });

  it('strictly bans exact same Xenos faction matchups (e.g. Tyranids vs Tyranids) but allows differing Xenos factions (e.g. Tyranids vs Orks)', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Tyranids', commander_name: 'Tyranid 1' },
      { id: '2', location: 'Seattle', experience_level: 'beginner', army_faction: 'Tyranids', commander_name: 'Tyranid 2' },
      { id: '3', location: 'Seattle', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'Ork Player' },
    ];

    const results = generateMatchups(pool);
    expect(results).toHaveLength(1);
    // Should pair Tyranids with Orks, NEVER Tyranids vs Tyranids
    const pairedFactions = [results[0].p1.army_faction, results[0].p2.army_faction];
    expect(pairedFactions).toContain('Orks');
    expect(pairedFactions).toContain('Tyranids');
  });

  it('allows Chaos vs Chaos but penalizes score so Chaos vs non-Chaos is preferred', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Seattle', experience_level: 'beginner', army_faction: 'Chaos Space Marines', commander_name: 'Chaos 1' },
      { id: '2', location: 'Seattle', experience_level: 'beginner', army_faction: 'Death Guard', commander_name: 'Chaos 2' },
      { id: '3', location: 'Seattle', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'Imperium 1' },
    ];

    const originalRandom = Math.random;
    Math.random = () => 0.01; // deterministic sorting

    const results = generateMatchups(pool);
    Math.random = originalRandom;

    expect(results).toHaveLength(1);
    // Chaos should pair with Imperium rather than Chaos vs Chaos
    const pairedFactions = [results[0].p1.army_faction, results[0].p2.army_faction];
    expect(pairedFactions).toContain('Space Marines');
  });
});
