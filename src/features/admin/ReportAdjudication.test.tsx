import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { Mock } from 'vitest';
import ReportAdjudication from './ReportAdjudication';
import { supabase } from '../../supabaseClient';
import { deedsForFaction, resolveTarget, baseTheatre } from '../../data/campaignDeeds';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

const necronReport = {
  id: 'match-1',
  p1_id: 'necron-player',
  p2_id: 'marine-player',
  campaign_month: 2,
  theatre_name: 'The Ash Wastes - Nomad Trail',
  status: 'completed',
  uncontested: false,
  p1_lore: 'We breached the tomb seals beneath the dunes and woke what slept there.',
  p2_lore: 'The dead rose faster than we could burn them.',
  p1_tldr: 'Tomb seals breached.',
  p2_tldr: 'Fighting withdrawal.',
  p1_profile: { commander_name: 'Necron Lord', army_faction: 'Necrons' },
  p2_profile: { commander_name: 'Marine Captain', army_faction: 'Space Marines' },
};

function mockSupabase({ matchups = [necronReport], awards = [] as unknown[], insert = vi.fn().mockResolvedValue({ error: null }), del = vi.fn() } = {}) {
  (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user: { id: 'admin-1' } } });
  (supabase.from as Mock).mockImplementation((table: string) => {
    if (table === 'campaign_awards') {
      return {
        select: vi.fn().mockResolvedValue({ data: awards, error: null }),
        insert,
        delete: vi.fn().mockReturnValue({ eq: del.mockResolvedValue({ error: null }) }),
      };
    }
    return {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: matchups, error: null }),
      }),
    };
  });
  return { insert, del };
}

describe('Battle report adjudication', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists submitted reports and shows the narrative to read', async () => {
    mockSupabase();
    render(<ReportAdjudication />);

    await waitFor(() => expect(screen.getByText(/Battle Report Adjudication/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Necron Lord vs Marine Captain/i));

    await waitFor(() => {
      expect(screen.getByText(/breached the tomb seals beneath the dunes/i)).toBeInTheDocument();
    });
  });

  it('offers only the deeds defined for that commander’s faction', async () => {
    mockSupabase();
    render(<ReportAdjudication />);
    await waitFor(() => screen.getByText(/Battle Report Adjudication/i));
    fireEvent.click(screen.getByText(/Necron Lord vs Marine Captain/i));

    const necronSelect = await screen.findByLabelText(/Deed for Necron Lord/i);
    expect(necronSelect.textContent).toMatch(/Awakened a tomb complex/i);
    // A Necron commander is not offered the Votann or Imperium deeds.
    expect(necronSelect.textContent).not.toMatch(/promethium cache/i);
    expect(necronSelect.textContent).not.toMatch(/Reinforced Imperial defences/i);

    const marineSelect = screen.getByLabelText(/Deed for Marine Captain/i);
    expect(marineSelect.textContent).toMatch(/Reinforced Imperial defences/i);
    expect(marineSelect.textContent).not.toMatch(/Awakened a tomb complex/i);
  });

  it('writes one ledger row per effect, resolving the battle target to the base theatre', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockSupabase({ insert });
    render(<ReportAdjudication />);
    await waitFor(() => screen.getByText(/Battle Report Adjudication/i));
    fireEvent.click(screen.getByText(/Necron Lord vs Marine Captain/i));

    const select = await screen.findByLabelText(/Deed for Necron Lord/i);
    fireEvent.change(select, { target: { value: 'necron-awaken-tomb' } });
    fireEvent.click(screen.getAllByText(/Award Deed/i)[0]);

    await waitFor(() => expect(insert).toHaveBeenCalled());
    const rows = insert.mock.calls[0][0];
    // The awakening credits the war zone AND the tomb world under The Sump Ruins.
    expect(rows).toHaveLength(2);
    expect(rows.every((r: { deed: string }) => r.deed === 'Awakened a tomb complex')).toBe(true);
    expect(rows.map((r: { territory_name: string }) => r.territory_name).sort())
      .toEqual(['The Ash Wastes', 'The Sump Ruins']);
    // 'The Ash Wastes - Nomad Trail' must resolve to the bare theatre the map keys on.
    expect(rows.every((r: { metric: string }) => r.metric === 'necron_foothold')).toBe(true);
    expect(rows.every((r: { commander_id: string }) => r.commander_id === 'necron-player')).toBe(true);
    expect(rows.every((r: { awarded_by: string }) => r.awarded_by === 'admin-1')).toBe(true);
  });

  it('shows awards already granted and allows withdrawing one', async () => {
    const del = vi.fn();
    mockSupabase({
      awards: [{
        id: 'award-1',
        matchup_id: 'match-1',
        commander_id: 'necron-player',
        deed: 'Awakened a tomb complex',
        metric: 'necron_foothold',
        territory_name: 'The Sump Ruins',
        delta: 5,
        created_at: '2026-10-01T00:00:00Z',
      }],
      del,
    });
    render(<ReportAdjudication />);
    await waitFor(() => screen.getByText(/Battle Report Adjudication/i));
    fireEvent.click(screen.getByText(/Necron Lord vs Marine Captain/i));

    // The same text appears in the deed dropdown, so scope to the Awarded list.
    await waitFor(() => expect(screen.getByText(/^Awarded$/)).toBeInTheDocument());
    const awarded = screen.getByText(/^Awarded$/).parentElement!;
    expect(awarded.textContent).toMatch(/\+5 Necron Awakening/);
    expect(awarded.textContent).toMatch(/@ The Sump Ruins/);
    fireEvent.click(screen.getByRole('button', { name: /Withdraw/i }));
    await waitFor(() => expect(del).toHaveBeenCalledWith('id', 'award-1'));
  });

  it('skips a side that submitted no report', async () => {
    mockSupabase({
      matchups: [{ ...necronReport, p2_lore: '', p2_tldr: '' }],
    });
    render(<ReportAdjudication />);
    await waitFor(() => screen.getByText(/Battle Report Adjudication/i));
    fireEvent.click(screen.getByText(/Necron Lord vs Marine Captain/i));

    await waitFor(() => expect(screen.getByLabelText(/Deed for Necron Lord/i)).toBeInTheDocument());
    // Nothing to adjudicate for a commander who wrote nothing.
    expect(screen.queryByLabelText(/Deed for Marine Captain/i)).not.toBeInTheDocument();
  });
});

describe('deed catalogue helpers', () => {
  it('resolves a battle target to the base theatre, matching the SQL split', () => {
    expect(baseTheatre('The Ash Wastes - Nomad Trail')).toBe('The Ash Wastes');
    expect(baseTheatre('Orbital Relay Station - Comms Array')).toBe('Orbital Relay Station');
    expect(baseTheatre(null)).toBe('');
  });

  it('gives campaign-wide effects no territory', () => {
    const votann = deedsForFaction('Leagues of Votann')
      .find(d => d.id === 'votann-secure-cache')!;
    expect(resolveTarget(votann.effects[0], 'The Magma Forges - Foundry Floor')).toBeNull();
  });

  it('pins a fixed-territory effect regardless of where the battle was', () => {
    const relic = deedsForFaction('Necrons').find(d => d.id === 'necron-reclaim-relic')!;
    expect(resolveTarget(relic.effects[0], 'The Toxic Oceans - Tidal Zone')).toBe('The Sump Ruins');
  });

  it('offers no deeds for a faction with none defined', () => {
    expect(deedsForFaction('Adeptus Titanicus').length).toBeGreaterThan(0); // Imperium list
    expect(deedsForFaction('Nonexistent Faction')).toHaveLength(0);
  });
});
