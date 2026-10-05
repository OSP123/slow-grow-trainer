import { describe, it, expect } from 'vitest';
import { territoryInfluence, TERRITORY_FACTIONS } from './territoryInfluence';
import { METRIC_LABELS } from './campaignDeeds';

describe('territory influence', () => {
  it('reads the untouched baseline as a contested Imperium/Chaos split', () => {
    const { shares, controller } = territoryInfluence({ imperium_control: 50, chaos_corruption: 50 });
    expect(shares.map(s => [s.label, s.share])).toEqual([['Imperium', 50], ['Chaos', 50]]);
    expect(controller).toBeNull();
  });

  it('gives xenos a share of the territory once they earn a score', () => {
    const { shares, controller } = territoryInfluence({
      imperium_control: 50, chaos_corruption: 45, ork_foothold: 5,
    });
    expect(shares.map(s => [s.label, s.share])).toEqual([['Imperium', 50], ['Chaos', 45], ['Orks', 5]]);
    expect(controller?.label).toBe('Imperium');
  });

  it('lets a xenos faction take control outright', () => {
    const { controller } = territoryInfluence({
      imperium_control: 10, chaos_corruption: 20, necron_foothold: 60,
    });
    expect(controller?.label).toBe('Necrons');
  });

  it('rounds shares so they always sum to exactly 100', () => {
    const { shares } = territoryInfluence({ imperium_control: 1, chaos_corruption: 1, ork_foothold: 1 });
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBe(100);
  });

  it('counts the new Votann and Drukhari meters', () => {
    const { shares } = territoryInfluence({ votann_foothold: 30, drukhari_foothold: 10 });
    expect(shares.map(s => [s.label, s.share])).toEqual([['Leagues of Votann', 75], ['Drukhari', 25]]);
  });

  it('treats missing, null and negative scores as no presence', () => {
    expect(territoryInfluence({})).toEqual({ shares: [], controller: null });
    expect(territoryInfluence({ imperium_control: null, chaos_corruption: -5 }).shares).toEqual([]);
  });

  it('covers every territorial award metric', () => {
    const territorial = Object.keys(METRIC_LABELS).filter(m => m !== 'votann_resources').sort();
    expect(TERRITORY_FACTIONS.map(f => f.metric).sort()).toEqual(territorial);
  });
});
