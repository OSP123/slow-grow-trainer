import { describe, it, expect } from 'vitest';
import { formatCommanderWithDiscord } from './commanderUtils';

describe('formatCommanderWithDiscord', () => {
  it('formats commander name with discord name when present directly on profile', () => {
    const profile = { commander_name: 'A-A-Ron', discord_name: 'aaron_dev' };
    expect(formatCommanderWithDiscord(profile)).toBe('A-A-Ron (aaron_dev)');
  });

  it('formats commander name with discord name from private_profiles object', () => {
    const profile = { commander_name: 'Shadowphrakt', private_profiles: { discord_name: 'shadow_csm' } };
    expect(formatCommanderWithDiscord(profile)).toBe('Shadowphrakt (shadow_csm)');
  });

  it('formats commander name with discord name from private_profiles array', () => {
    const profile = { commander_name: 'Ghazghkull', private_profiles: [{ discord_name: 'waaagh_boss' }] };
    expect(formatCommanderWithDiscord(profile)).toBe('Ghazghkull (waaagh_boss)');
  });

  it('returns only commander name if discord name is missing or empty', () => {
    expect(formatCommanderWithDiscord({ commander_name: 'P1' })).toBe('P1');
    expect(formatCommanderWithDiscord({ commander_name: 'P2', discord_name: '   ' })).toBe('P2');
  });

  it('does not duplicate discord name if already present in commander name', () => {
    const profile = { commander_name: 'A-A-Ron (aaron_dev)', discord_name: 'aaron_dev' };
    expect(formatCommanderWithDiscord(profile)).toBe('A-A-Ron (aaron_dev)');
  });
});
