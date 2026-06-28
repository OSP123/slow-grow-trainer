import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })
    }),
  },
}));

vi.mock('../../hooks/useUnitRegistry', () => ({
  useUnitRegistry: vi.fn().mockReturnValue({
    unitsByFaction: {
      'Space Marines': ['Intercessor Squad', 'Dreadnought'],
      'Astra Militarum': ['Infantry Squad']
    },
    rawRegistry: [],
    loading: false,
    refreshRegistry: vi.fn()
  })
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
  if (table === 'campaign_state') {
    return {
      select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) })
    };
  }
  if (table === 'map_locations') {
    return {
      select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) })
    };
  }
  if (table === 'profiles') {
    const chainable = Promise.resolve({ data: [{ id: '1', commander_name: 'Test', payment_status: false }], error: null }) as any;
    chainable.eq = vi.fn().mockReturnValue(chainable);
    chainable.single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
    chainable.order = vi.fn().mockReturnValue(chainable);
    return {
      select: vi.fn().mockReturnValue(chainable),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    };
  }
  return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
};

describe('AdminDashboard (RBAC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects users without the admin role', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'user_123', email: 'standard_commander@admin.com' } }
    });
    // Mock profiles select to return role: 'user'
    const chainable = Promise.resolve({ data: { role: 'user' }, error: null }) as any;
    chainable.single = vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null });
    chainable.eq = vi.fn().mockReturnValue(chainable);
    
    (supabase.from as import('vitest').Mock).mockReturnValue({
      select: vi.fn().mockReturnValue(chainable)
    });

    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/UNAUTHORIZED: Clearance Denied/i)).toBeInTheDocument();
    });
  });

  it('reveals the admin dashboard when the user has the admin role', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'admin_123', email: 'omarpatel123@gmail.com' } }
    });
    (supabase.from as import('vitest').Mock).mockImplementation(mockFromUnlocked);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Matchup Command Override/i)).toBeInTheDocument();
      expect(screen.getByText(/Manual Narrative Pairing/i)).toBeInTheDocument();
      expect(screen.getByText(/Munitorum Field Manual/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Voting Tallies/i)).toBeInTheDocument();
      expect(screen.getByText(/Leman Russ/i)).toBeInTheDocument();
    });
  });

  it('displays a Reinstate button for removed commanders', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'admin_123', email: 'omarpatel123@gmail.com' } }
    });
    const customMockFrom = (table: string) => {
      if (table === 'profiles') {
        const chainable = Promise.resolve({ data: [{ id: '1', commander_name: 'Fallen Hero', campaign_status: 'removed' }], error: null }) as any;
        chainable.eq = vi.fn().mockReturnValue(chainable);
        chainable.single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
        chainable.order = vi.fn().mockReturnValue(chainable);
        return {
          select: vi.fn().mockReturnValue(chainable),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
        };
      }
      return mockFromUnlocked(table);
    };
    (supabase.from as import('vitest').Mock).mockImplementation(customMockFrom);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Fallen Hero/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reinstate/i })).toBeInTheDocument();
    });
  });
});
