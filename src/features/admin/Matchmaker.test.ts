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

  it('spreads matchups across all 6 real planetary theatres using exact real sector names without hallucinating zones', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P1' },
      { id: '2', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P2' },
      { id: '3', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P3' },
      { id: '4', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P4' },
      { id: '5', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P5' },
      { id: '6', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P6' },
      { id: '7', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P7' },
      { id: '8', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P8' },
      { id: '9', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P9' },
      { id: '10', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P10' },
      { id: '11', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P11' },
      { id: '12', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P12' },
    ];

    const results = generateMatchups(pool);
    expect(results).toHaveLength(6);

    const assignedTheatres = results.map(r => r.theatre_name.split(' - ')[0]);
    expect(assignedTheatres).toContain('The Hive Spires');
    expect(assignedTheatres).toContain('The Ash Wastes');
    expect(assignedTheatres).toContain('The Magma Forges');
    expect(assignedTheatres).toContain('Orbital Relay Station');
    expect(assignedTheatres).toContain('The Sump Ruins');
    expect(assignedTheatres).toContain('The Toxic Oceans');

    // Verify each sub-sector is a real sector name for that theatre
    const REAL_SECTORS: Record<string, string[]> = {
      'The Hive Spires': ['Outer Wall', 'Hab Districts', 'Merchant Quarter', 'Administratum', 'Spire Apex'],
      'The Ash Wastes': ['Rad Perimeter', 'Nomad Trail', 'Storm Corridor', 'Scavenger Dens', 'Dead Zone'],
      'The Magma Forges': ['Cooling Vents', 'Extraction Bay', 'Foundry Floor', 'Slag Channels', 'Forge Core'],
      'Orbital Relay Station': ['Docking Pylons', 'Comms Array', 'Weapons Battery', 'Engineering Deck', 'Command Bridge'],
      'The Sump Ruins': ['Crater Rim', 'Outer Ruins', 'Collapsed Tunnels', 'Warp Fissure', 'Buried Tomb'],
      'The Toxic Oceans': ['Shore Batteries', 'Tidal Zone', 'Deep Channels', 'Leviathan Depths', 'Abyssal Trench']
    };

    results.forEach(r => {
      const [theatre, sector] = r.theatre_name.split(' - ');
      expect(REAL_SECTORS[theatre]).toBeDefined();
      expect(REAL_SECTORS[theatre]).toContain(sector);
    });
  });

  it('assigns the exact sector matching the current campaign month points value (Month 3 = 1200 pts = index 2)', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'LA', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P1' },
      { id: '2', location: 'LA', experience_level: 'beginner', army_faction: 'Orks', commander_name: 'P2' },
    ];

    // Month 3 corresponds to 1200 points (sector index 2)
    const results = generateMatchups(pool, 3);
    expect(results).toHaveLength(1);
    
    const [, sector] = results[0].theatre_name.split(' - ');
    // Index 2 sectors across the theatres: 'Merchant Quarter', 'Storm Corridor', 'Foundry Floor', 'Weapons Battery', 'Collapsed Tunnels', 'Deep Channels'
    const month3Sectors = ['Merchant Quarter', 'Storm Corridor', 'Foundry Floor', 'Weapons Battery', 'Collapsed Tunnels', 'Deep Channels'];
    expect(month3Sectors).toContain(sector);
  });

  it('heavily prioritizes location preferences (+100 pts) from Round 2 onwards (currentMonth > 1)', () => {
    const pool: CommanderProfile[] = [
      { id: '1', location: 'Los Angeles, 90036', experience_level: 'beginner', army_faction: 'Space Marines', commander_name: 'P1' },
      { id: '2', location: 'New York City', experience_level: 'beginner', army_faction: 'Chaos Space Marines', commander_name: 'P2' },
      { id: '3', location: 'Santa Monica, 90036', experience_level: 'expert', army_faction: 'Orks', commander_name: 'P3' },
    ];

    // In Round 2, P1 should pair with P3 because of matching zip code 90036 (+100), overriding Attacker vs Defender (+20) with Chaos P2
    const results = generateMatchups(pool, 2);
    expect(results).toHaveLength(1);
    const pairedIDs = [results[0].p1.id, results[0].p2.id];
    expect(pairedIDs).toContain('1');
    expect(pairedIDs).toContain('3');
  });
});
