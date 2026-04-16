import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

const mockFromUnlocked = (table: string) => {
  if (table === 'campaign_votes') {
    return {
      select: vi.fn().mockResolvedValue({
        data: [{ id: 'vote1', category: 'best_painted', profiles: { commander_name: 'Leman Russ' } }],
        error: null,
      }),
    };
  }
  if (table === 'game_stores') {
    return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [] }) }) };
  }
  if (table === 'matchups') {
    return {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    };
  }
  if (table === 'unit_points') {
    return {
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    };
  }
  return {};
};

describe('AdminDashboard (RBAC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects users without the root admin email', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { email: 'standard_commander@admin.com' } }
    });
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/UNAUTHORIZED: Clearance Denied/i)).toBeInTheDocument();
    });
  });

  it('presents the security gateway to the root email', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { email: 'omarpatel123@gmail.com' } }
    });
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Admin Override Code/i)).toBeInTheDocument();
    });
  });

  it('reveals the matchup management panel after unlocking', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { email: 'omarpatel123@gmail.com' } }
    });
    (supabase.from as import('vitest').Mock).mockImplementation(mockFromUnlocked);

    render(<AdminDashboard />);

    await waitFor(() => screen.getByPlaceholderText(/Enter Admin Override Code/i));
    fireEvent.change(screen.getByPlaceholderText(/Enter Admin Override Code/i), { target: { value: 'TERMINUS_ROOT' } });
    fireEvent.click(screen.getByRole('button', { name: /Unlock Root Access/i }));

    await waitFor(() => {
      expect(screen.getByText(/Matchup Command Override/i)).toBeInTheDocument();
      expect(screen.getByText(/Munitorum Field Manual/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Voting Tallies/i)).toBeInTheDocument();
      expect(screen.getByText(/Leman Russ/i)).toBeInTheDocument();
    });
  });
});
