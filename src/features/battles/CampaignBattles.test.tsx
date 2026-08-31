import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CampaignBattles from './CampaignBattles';
import { supabase } from '../../supabaseClient';
import type { Mock } from 'vitest';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  }
}));

const mockMatchups = [
  {
    id: 'match-1',
    p1_id: 'user-p1-123',
    p2_id: 'user-p2-456',
    status: 'scheduled',
    p1_score: null,
    p2_score: null,
    p1_lore: null,
    p2_lore: null,
    p1_tldr: null,
    p2_tldr: null,
    game_result: null,
    p1_temperament: null,
    p2_temperament: null,
    p1_rules_engagement: null,
    p2_rules_engagement: null,
    p1_profile: { commander_name: 'Commander Alpha' },
    p2_profile: { commander_name: 'Commander Beta' },
  }
];

describe('Campaign Battles Integrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: { id: 'user-p1-123' } }
    });

    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockMatchups,
          error: null,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }));
  });

  it('shows loading state initially', () => {
    render(<CampaignBattles />);
    expect(screen.getByText(/Awaiting Astropathic Relay/i)).toBeInTheDocument();
  });

  it('renders both global board and assigned frontlines after load', async () => {
    render(<CampaignBattles />);
    await waitFor(() => {
      expect(screen.getByText('Global Warzone Board')).toBeInTheDocument();
      expect(screen.getByText('My Assigned Frontlines')).toBeInTheDocument();
      expect(screen.getAllByText(/Commander Alpha/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Commander Beta/i).length).toBeGreaterThan(0);
    });
  });

  it('shows VP tracker panel when a match is selected', async () => {
    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    // Sidebar shows "vs Commander Beta" for a p1 user
    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => {
      expect(screen.getByText(/Live VP Tracker/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Your VP Score/i)).toBeInTheDocument();
    });
  });

  it('shows finalization panel with Command Temperament and Rules of Engagement', async () => {
    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    // Wait for the VP tracker to appear (match is selected)
    await waitFor(() => screen.getByText(/Live VP Tracker/i));

    // Click Finalize to switch to the assessment panel
    const finalizeBtn = await screen.findByText(/^Finalize Battle →$/);
    fireEvent.click(finalizeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Rate Your Opponent's Honour/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Command Temperament/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Hobby Spirit/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Seal Battle Report/i)).toBeInTheDocument();
    });
  });

  it('shows TL;DR input field in the VP tracker panel', async () => {
    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => {
      expect(screen.getByLabelText(/Battle Summary \(TL;DR\)/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/One-line summary/i)).toBeInTheDocument();
    });
  });

  it('shows both VP score fields as editable inputs', async () => {
    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => {
      expect(screen.getByLabelText(/Your VP Score/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Opponent VP Score/i)).toBeInTheDocument();
      // Both should be editable inputs, not read-only
      expect(screen.getByLabelText(/Your VP Score/i)).not.toBeDisabled();
      expect(screen.getByLabelText(/Opponent VP Score/i)).not.toBeDisabled();
    });
  });

  it('saves both VP scores but only own lore/tldr', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    (supabase.from as Mock).mockImplementation((table: string) => {
      if (table === 'matchups') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockMatchups,
              error: null,
            }),
          }),
          update: mockUpdate,
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      };
    });

    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => screen.getByText(/Live VP Tracker/i));

    // Enter both VP scores
    const myScoreInput = screen.getByLabelText(/Your VP Score/i);
    const oppScoreInput = screen.getByLabelText(/Opponent VP Score/i);
    fireEvent.change(myScoreInput, { target: { value: '55' } });
    fireEvent.change(oppScoreInput, { target: { value: '40' } });

    // Click Save VP Progress
    const saveBtn = screen.getByText(/Save VP Progress/i);
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      const payload = mockUpdate.mock.calls[0][0];
      // P1 user: both scores should be in payload
      expect(payload.p1_score).toBe(55);
      expect(payload.p2_score).toBe(40);
      // Own lore/tldr included, opponent lore/tldr not
      expect(payload).toHaveProperty('p1_lore');
      expect(payload).toHaveProperty('p1_tldr');
      expect(payload).not.toHaveProperty('p2_lore');
      expect(payload).not.toHaveProperty('p2_tldr');
    });
  });

  it('toggles battle reports dropdown when clicked on Global Warzone Board card', async () => {
    const matchupWithLore = [{
      ...mockMatchups[0],
      p1_lore: 'The Space Marines charged fearlessly into the breach.',
      p2_lore: 'The Orks held the line with dakka.',
      p1_tldr: 'Marines won the flank',
      p2_tldr: 'Orks held the center',
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: matchupWithLore,
          error: null,
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }));

    render(<CampaignBattles />);
    await waitFor(() => {
      expect(screen.getByText('Global Warzone Board')).toBeInTheDocument();
    });

    expect(screen.queryByText(/The Space Marines charged fearlessly/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Marines won the flank/i)).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /View Battle Reports/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      // TL;DR summaries should appear
      expect(screen.getByText(/Marines won the flank/i)).toBeInTheDocument();
      expect(screen.getByText(/Orks held the center/i)).toBeInTheDocument();
      // Full lore should also appear
      expect(screen.getByText(/The Space Marines charged fearlessly/i)).toBeInTheDocument();
      expect(screen.getByText(/The Orks held the line/i)).toBeInTheDocument();
    });
  });
  it('still offers finalization when the opponent sealed the match first', async () => {
    // Reported bug: P2 finalized, flipping status to 'completed'. P1 had never
    // rated their opponent, but the panel read as a finished record so P1
    // could not tell the report was still owed.
    const opponentSealed = [{
      ...mockMatchups[0],
      status: 'completed',
      campaign_month: 2,
      game_result: 'p1_win',
      p1_score: 80,
      p2_score: 75,
      // Ratings P1 received from P2 are present; the ones P1 owes are not.
      p1_temperament: 5,
      p1_rules_engagement: 5,
      p2_temperament: null,
      p2_rules_engagement: null,
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: opponentSealed, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }));

    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    // The outstanding-report prompt tells P1 they still owe their ratings.
    const prompt = await screen.findByText(/Your battle report is still outstanding/i);
    expect(prompt).toBeInTheDocument();

    // And it leads straight into the honour-rating form.
    fireEvent.click(screen.getByText(/^Finalize Battle Report →$/));
    await waitFor(() => {
      expect(screen.getByText(/Rate Your Opponent's Honour/i)).toBeInTheDocument();
      expect(screen.getByText(/Seal Battle Report/i)).toBeInTheDocument();
    });
  });

  it('hides the outstanding-report prompt once this Commander has rated', async () => {
    const bothSubmitted = [{
      ...mockMatchups[0],
      status: 'completed',
      p1_temperament: 5,
      p1_rules_engagement: 5,
      p2_temperament: 4,
      p2_rules_engagement: 4,
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: bothSubmitted, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }));

    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => screen.getByText(/Live VP Tracker/i));
    expect(screen.queryByText(/Your battle report is still outstanding/i)).not.toBeInTheDocument();
    // The header entry point remains available for edits.
    expect(screen.getByText(/^Finalize Battle →$/)).toBeInTheDocument();
  });
  it('explains a withdrawn opponent instead of demanding a battle report', async () => {
    // A dropped commander no longer deletes the pairing, so the surviving
    // Commander keeps a visible frontline and is told why it is idle.
    const opponentWithdrew = [{
      ...mockMatchups[0],
      campaign_month: 2,
      needs_reassignment: true,
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: opponentWithdrew, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }));

    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    // The frontline is still listed, flagged as awaiting reassignment.
    expect(screen.getByText(/Awaiting reassignment/i)).toBeInTheDocument();

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => {
      expect(screen.getByText(/Your opponent has withdrawn from the campaign/i)).toBeInTheDocument();
    });
    // No report is owed for a match that cannot be fought.
    expect(screen.queryByText(/Your battle report is still outstanding/i)).not.toBeInTheDocument();
  });
  it('lets a stranded commander claim 100 VP and file a report when the opponent drops', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const opponentWithdrew = [{
      ...mockMatchups[0],
      campaign_month: 2,
      needs_reassignment: true,
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: opponentWithdrew, error: null }),
      }),
      update: mockUpdate,
    }));

    const { container } = render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => screen.getByText(/Your opponent has withdrawn/i));
    fireEvent.click(screen.getByText(/Claim Uncontested Victory/i));

    // The commander can still write their chronicle of the advance.
    // Query by id: the VP tracker below carries identically-labelled fields.
    await waitFor(() => expect(container.querySelector('#uncontestedTldr')).toBeTruthy());
    fireEvent.change(container.querySelector('#uncontestedTldr')!, {
      target: { value: 'The Ash Wastes fell silent.' },
    });
    fireEvent.change(container.querySelector('#uncontestedLore')!, {
      target: { value: 'No enemy stood against us.' },
    });

    fireEvent.click(screen.getByText(/Record 100 VP Uncontested Victory/i));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      const payload = mockUpdate.mock.calls[0][0];
      // P1 user takes the full award; the withdrawn opponent scores nothing.
      expect(payload.p1_score).toBe(100);
      expect(payload.p2_score).toBe(0);
      expect(payload.status).toBe('completed');
      expect(payload.game_result).toBe('p1_win');
      expect(payload.uncontested).toBe(true);
      expect(payload.p1_tldr).toBe('The Ash Wastes fell silent.');
      expect(payload.p1_lore).toBe('No enemy stood against us.');
      // Nobody is rated for a battle that never happened.
      expect(payload).not.toHaveProperty('p2_temperament');
      expect(payload).not.toHaveProperty('p2_rules_engagement');
    });
  });

  it('shows an uncontested result instead of an empty honour roll', async () => {
    const claimed = [{
      ...mockMatchups[0],
      status: 'completed',
      campaign_month: 2,
      needs_reassignment: true,
      uncontested: true,
      game_result: 'p1_win',
      p1_score: 100,
      p2_score: 0,
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: claimed, error: null }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }));

    render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));
    expect(screen.getByText(/Uncontested victory/i)).toBeInTheDocument();

    const sidebarItem = await screen.findByText(/vs Commander Beta/i);
    fireEvent.click(sidebarItem.closest('li')!);

    await waitFor(() => {
      expect(screen.getByText(/⚑ Uncontested Victory/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Honour Roll/i)).not.toBeInTheDocument();
    // Already resolved, so no lingering claim prompt.
    expect(screen.queryByText(/Claim Uncontested Victory/i)).not.toBeInTheDocument();
  });
  it('lets a commander with no opponent at all claim the uncontested victory', async () => {
    // A bye: p2_id is null because the opponent withdrew and the original
    // pairing was already gone, so there is nobody to name or rate.
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    const bye = [{
      ...mockMatchups[0],
      p2_id: null,
      p2_profile: null,
      campaign_month: 2,
      needs_reassignment: true,
    }];
    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: bye, error: null }),
      }),
      update: mockUpdate,
    }));

    const { container } = render(<CampaignBattles />);
    await waitFor(() => screen.getByText('My Assigned Frontlines'));

    // The frontline is listed with no opponent rather than "vs Unknown".
    // The same label also appears on the Global Warzone Board, so scope to the list.
    const sidebarItem = await waitFor(() => {
      const li = [...container.querySelectorAll('li')]
        .find(el => /No opponent \(withdrew\)/i.test(el.textContent || ''));
      expect(li).toBeTruthy();
      return li!;
    });
    fireEvent.click(sidebarItem);

    await waitFor(() => screen.getByText(/Your opponent has withdrawn/i));
    fireEvent.click(screen.getByText(/Claim Uncontested Victory/i));

    await waitFor(() => expect(container.querySelector('#uncontestedTldr')).toBeTruthy());
    fireEvent.change(container.querySelector('#uncontestedTldr')!, {
      target: { value: 'We held the line alone.' },
    });
    fireEvent.click(screen.getByText(/Record 100 VP Uncontested Victory/i));

    await waitFor(() => {
      const payload = mockUpdate.mock.calls[0][0];
      expect(payload.p1_score).toBe(100);
      expect(payload.status).toBe('completed');
      expect(payload.uncontested).toBe(true);
      expect(payload.p1_tldr).toBe('We held the line alone.');
    });
  });
});
