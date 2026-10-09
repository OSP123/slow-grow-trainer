import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import type { Mock } from 'vitest';
import { supabase } from '../../supabaseClient';
import { validateNomination, DESCRIPTION_MAX } from './legendaryMoments';
import NominateMoment from './NominateMoment';
import MomentReview from './MomentReview';
import LegendaryMomentsList from './LegendaryMomentsList';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

const armiger = {
  id: 'mom-1',
  matchup_id: 'match-1',
  nominated_by: 'me',
  honoured_id: 'me',
  title: 'The Armiger’s Last Stand',
  description: 'The young pilot duelled the Daemon Prince and took it down with him.',
  status: 'approved',
  created_at: '2026-10-01T00:00:00Z',
  honoured: { commander_name: 'Canoness Ilse', army_faction: 'Adepta Sororitas' },
  nominator: { commander_name: 'Canoness Ilse', army_faction: 'Adepta Sororitas' },
  matchup: { campaign_month: 1, theatre_name: 'The Ash Wastes - Rad Perimeter' },
};

/** A thenable query builder: every filter returns itself, awaiting resolves `result`. */
function query(result: { data: unknown; error: unknown }) {
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'order']) q[m] = vi.fn(() => q);
  q.maybeSingle = vi.fn().mockResolvedValue(result);
  q.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return q;
}

describe('validateNomination', () => {
  it('accepts a titled, described moment', () => {
    expect(validateNomination('Last Stand', 'The pilot held the line alone.')).toBeNull();
  });

  it('rejects empty or overlong entries', () => {
    expect(validateNomination('  ', 'The pilot held the line alone.')).toMatch(/title/);
    expect(validateNomination('Last Stand', 'short')).toMatch(/sentence/);
    expect(validateNomination('Last Stand', 'x'.repeat(DESCRIPTION_MAX + 1))).toMatch(/500/);
  });
});

describe('NominateMoment', () => {
  beforeEach(() => vi.clearAllMocks());

  it('nominates the opponent’s moment from a completed battle', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as Mock).mockImplementation(() => ({ ...query({ data: null, error: null }), insert }));

    render(<NominateMoment matchupId="match-1" userId="me" opponentId="them" opponentName="Ichabod" />);
    fireEvent.click(await screen.findByText(/Nominate a Legendary Moment/i));

    fireEvent.click(screen.getByLabelText(/Ichabod’s/));
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Third Squawk' } });
    fireEvent.change(screen.getByLabelText(/What happened/), { target: { value: 'Ichabod lunged at the Commander and the whole force vanished.' } });
    fireEvent.click(screen.getByText(/Submit nomination/i));

    await waitFor(() => expect(insert).toHaveBeenCalledWith({
      matchup_id: 'match-1',
      nominated_by: 'me',
      honoured_id: 'them',
      title: 'Third Squawk',
      description: 'Ichabod lunged at the Commander and the whole force vanished.',
    }));
  });

  it('does not submit an invalid nomination', async () => {
    const insert = vi.fn();
    (supabase.from as Mock).mockImplementation(() => ({ ...query({ data: null, error: null }), insert }));

    render(<NominateMoment matchupId="match-1" userId="me" opponentId="them" />);
    fireEvent.click(await screen.findByText(/Nominate a Legendary Moment/i));
    fireEvent.click(screen.getByText(/Submit nomination/i));

    expect(await screen.findByText(/title of at least 3 characters/i)).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();
  });

  it('shows an existing pending nomination with a withdraw option instead of the form', async () => {
    (supabase.from as Mock).mockImplementation(() => query({ data: { ...armiger, status: 'pending' }, error: null }));

    render(<NominateMoment matchupId="match-1" userId="me" opponentId="them" />);
    expect(await screen.findByText(/Awaiting review/i)).toBeInTheDocument();
    expect(screen.getByText(/Withdraw nomination/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nominate a Legendary Moment/i)).not.toBeInTheDocument();
  });

  it('offers no honouree choice on a bye', async () => {
    (supabase.from as Mock).mockImplementation(() => query({ data: null, error: null }));

    render(<NominateMoment matchupId="match-1" userId="me" opponentId={null} />);
    fireEvent.click(await screen.findByText(/Nominate a Legendary Moment/i));
    expect(screen.queryByText(/Whose moment was it/i)).not.toBeInTheDocument();
  });
});

describe('MomentReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('approves a pending nomination', async () => {
    (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    (supabase.from as Mock).mockImplementation(() => ({
      ...query({ data: [{ ...armiger, status: 'pending' }], error: null }),
      update,
    }));

    render(<MomentReview />);
    fireEvent.click(await screen.findByText('Approve'));

    await waitFor(() => expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved', reviewed_by: 'admin-1' })
    ));
    expect(eq).toHaveBeenCalledWith('id', 'mom-1');
  });
});

describe('LegendaryMomentsList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows approved moments with commander, round and war zone', async () => {
    (supabase.from as Mock).mockImplementation(() => query({ data: [armiger], error: null }));

    render(<LegendaryMomentsList />);
    expect(await screen.findByText(/The Armiger’s Last Stand/)).toBeInTheDocument();
    expect(screen.getByText(/Round 1 · The Ash Wastes/)).toBeInTheDocument();
  });

  it('shows the empty text when there are none', async () => {
    (supabase.from as Mock).mockImplementation(() => query({ data: [], error: null }));

    render(<LegendaryMomentsList emptyText="Nothing yet." />);
    expect(await screen.findByText('Nothing yet.')).toBeInTheDocument();
  });
});
