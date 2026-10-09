import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';
import { supabase } from '../../supabaseClient';
import TerritoryDeedLog from './TerritoryDeedLog';
import { deedsForTerritory } from './territoryDeeds';

vi.mock('../../supabaseClient', () => ({
  supabase: { from: vi.fn() },
}));

const daemons = { commander_name: 'Ichabod', army_faction: 'Chaos Daemons' };
const necron = { commander_name: 'Aratekh', army_faction: 'Necrons' };

const rows = [
  // A ritual is two ledger rows; it should read as one deed.
  { id: '1', matchup_id: 'm41', commander_id: 'c1', deed: 'Completed a dark ritual', metric: 'chaos_corruption' as const, territory_name: 'Orbital Relay Station', delta: 5, created_at: '2026-10-09T00:00:02Z', commander: daemons, matchup: { campaign_month: 3, theatre_name: 'Orbital Relay Station - Weapons Battery' } },
  { id: '2', matchup_id: 'm41', commander_id: 'c1', deed: 'Completed a dark ritual', metric: 'imperium_control' as const, territory_name: 'Orbital Relay Station', delta: -5, created_at: '2026-10-09T00:00:02Z', commander: daemons, matchup: { campaign_month: 3, theatre_name: 'Orbital Relay Station - Weapons Battery' } },
  // A tomb awakening fought at the Orbital Relay also stirs the Sump.
  { id: '3', matchup_id: 'm15', commander_id: 'c2', deed: 'Awakened a tomb complex', metric: 'necron_foothold' as const, territory_name: 'The Sump Ruins', delta: 5, created_at: '2026-10-09T00:00:01Z', commander: necron, matchup: { campaign_month: 1, theatre_name: 'Orbital Relay Station - Docking Pylons' } },
];

describe('deedsForTerritory', () => {
  it('folds a multi-effect deed into one entry', () => {
    const entries = deedsForTerritory(rows, 'Orbital Relay Station');
    expect(entries).toHaveLength(1);
    expect(entries[0].effects).toEqual([
      { metric: 'chaos_corruption', delta: 5 },
      { metric: 'imperium_control', delta: -5 },
    ]);
    expect(entries[0].foughtIn).toBeUndefined();
  });

  it('notes when the battle was fought in another war zone', () => {
    const [entry] = deedsForTerritory(rows, 'The Sump Ruins');
    expect(entry.deed).toBe('Awakened a tomb complex');
    expect(entry.foughtIn).toBe('Orbital Relay Station');
  });
});

describe('TerritoryDeedLog', () => {
  const mockAwards = (data: unknown[]) => {
    const q: Record<string, unknown> = {};
    q.select = vi.fn(() => q);
    q.eq = vi.fn().mockResolvedValue({ data, error: null });
    (supabase.from as Mock).mockReturnValue(q);
  };

  it('lists the deeds credited to a war zone with commander, round and effects', async () => {
    mockAwards(rows.slice(0, 2));
    render(<TerritoryDeedLog territory="Orbital Relay Station" />);
    expect(await screen.findByText('Completed a dark ritual')).toBeInTheDocument();
    expect(screen.getByText(/Ichabod, Round 3/)).toBeInTheDocument();
    expect(screen.getByText('+5 Warp Corruption')).toBeInTheDocument();
    expect(screen.getByText('-5 Imperium Control')).toBeInTheDocument();
  });

  it('explains an empty war zone', async () => {
    mockAwards([]);
    render(<TerritoryDeedLog territory="The Toxic Oceans" />);
    expect(await screen.findByText(/No deeds credited here yet/)).toBeInTheDocument();
  });
});
