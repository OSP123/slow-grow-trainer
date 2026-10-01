import { describe, it, expect } from 'vitest';
import { THEATRE_NAMES, THEATRE_SECTORS, asTheatreName, baseTheatre, buildTheatreName, sectorForMonth } from './theatres';

// Consumers are now typed against TheatreName, so a renamed or missing war zone
// is a compile error rather than something these tests have to catch. What is
// left to verify is the runtime behaviour around the names.
describe('canonical war zone names', () => {
  it('lists exactly the six war zones, with no duplicates', () => {
    expect(THEATRE_NAMES).toHaveLength(6);
    expect(new Set(THEATRE_NAMES).size).toBe(6);
    expect(Object.keys(THEATRE_SECTORS).sort()).toEqual([...THEATRE_NAMES].sort());
  });

  it('narrows a real name and rejects anything else', () => {
    expect(asTheatreName('The Sump Ruins')).toBe('The Sump Ruins');
    expect(asTheatreName('The Sump')).toBeUndefined();
    expect(asTheatreName('')).toBeUndefined();
    expect(asTheatreName(null)).toBeUndefined();
  });

  it('gives every theatre a sector for each of the five rounds', () => {
    for (const name of THEATRE_NAMES) {
      expect(THEATRE_SECTORS[name]).toHaveLength(5);
    }
  });

  it('strips the sub-sector the way the SQL split does', () => {
    expect(baseTheatre('The Ash Wastes - Nomad Trail')).toBe('The Ash Wastes');
    expect(baseTheatre('Orbital Relay Station - Comms Array')).toBe('Orbital Relay Station');
    expect(baseTheatre('The Sump Ruins')).toBe('The Sump Ruins');
    expect(baseTheatre(null)).toBe('');
    expect(baseTheatre(undefined)).toBe('');
  });

  it('round-trips a built name back to its theatre', () => {
    for (const name of THEATRE_NAMES) {
      for (let round = 1; round <= 5; round++) {
        expect(baseTheatre(buildTheatreName(name, round))).toBe(name);
      }
    }
  });

  it('advances the sub-sector as the campaign progresses', () => {
    expect(sectorForMonth('The Ash Wastes', 1)).toBe('Rad Perimeter');
    expect(sectorForMonth('The Ash Wastes', 2)).toBe('Nomad Trail');
    expect(sectorForMonth('The Ash Wastes', 4)).toBe('Scavenger Dens');
    // Out of range clamps rather than returning undefined.
    expect(sectorForMonth('The Ash Wastes', 99)).toBe('Dead Zone');
    expect(sectorForMonth('The Ash Wastes', 0)).toBe('Rad Perimeter');
  });

  it('falls back to the default theatre for an unknown name', () => {
    expect(buildTheatreName('Rad-Zone Gamma', 2)).toBe('The Ash Wastes - Nomad Trail');
  });

  it('no longer offers the war zones that never existed', () => {
    // The global event dropdown used to offer these; none is a real theatre.
    for (const bogus of ['Hive Primus', 'Magma Forges', 'Orbital Tether', 'The Sump', 'Rad-Zone Gamma']) {
      expect(THEATRE_NAMES).not.toContain(bogus);
    }
  });
});
