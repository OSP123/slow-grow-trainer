import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('Campaign Battles Integrations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Active Warzones securely resolving nested profiles', async () => {
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: { id: 'user-p1-123' } }
    });

    const mockSelect = vi.fn().mockReturnValue({
      or: vi.fn().mockResolvedValue({
        data: [{
            id: 'match-1',
            p1_id: 'user-p1-123',
            p2_id: 'user-p2-456',
            p1_profile: { commander_name: 'P1-Alpha' },
            p2_profile: { commander_name: 'P2-Beta' }
        }], 
        error: null 
      })
    });

    (supabase.from as Mock).mockImplementation(() => ({
      select: mockSelect
    }));

    render(<CampaignBattles />);

    expect(screen.getByText(/Locating Active Warzones/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/P1-Alpha/i)).toBeInTheDocument();
      expect(screen.getByText(/P2-Beta/i)).toBeInTheDocument();
    });
  });
});
