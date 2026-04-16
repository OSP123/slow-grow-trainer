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
    expect(screen.getByText(/Locating Active Warzones/i)).toBeInTheDocument();
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
    const finalizeBtn = await screen.findByText(/Finalize Battle/i);
    fireEvent.click(finalizeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Rate Your Opponent's Honour/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Command Temperament/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Rules of Engagement/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Seal Battle Report/i)).toBeInTheDocument();
    });
  });
});
