import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
      expect(screen.getByText(/Matchups & Pairings Management/i)).toBeInTheDocument();
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

  it('displays player faction and win-loss record in simulated and manual matchup options', async () => {
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'admin_123', email: 'omarpatel123@gmail.com' } }
    });

    const mockProfiles = [
      { id: 'p1', commander_name: 'Lord Castellan', location: 'LA', experience_level: 'Veteran', army_faction: 'Space Marines', campaign_status: 'active' },
      { id: 'p2', commander_name: 'Commander Farsight', location: 'LA', experience_level: 'Veteran', army_faction: "T'au Empire", campaign_status: 'active' }
    ];

    const mockCompletedMatchups = [
      { id: 'm1', p1_id: 'p1', p2_id: 'other', game_result: 'p1_win', status: 'completed' },
      { id: 'm2', p1_id: 'other2', p2_id: 'p2', game_result: 'p1_win', status: 'completed' }
    ];

    const customMockFrom = (table: string) => {
      if (table === 'profiles') {
        const chainable = Promise.resolve({ data: mockProfiles, error: null }) as any;
        chainable.eq = vi.fn().mockImplementation((col: string, val: string) => {
          if (col === 'campaign_status' && val === 'active') {
            return Promise.resolve({ data: mockProfiles, error: null });
          }
          return chainable;
        });
        chainable.single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
        chainable.order = vi.fn().mockReturnValue(chainable);
        return {
          select: vi.fn().mockReturnValue(chainable),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
        };
      }
      if (table === 'matchups') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockCompletedMatchups, error: null }),
          }),
        };
      }
      return mockFromUnlocked(table);
    };
    (supabase.from as import('vitest').Mock).mockImplementation(customMockFrom);

    render(<AdminDashboard />);

    // Verify option text includes faction and win-loss record
    await waitFor(() => {
      expect(screen.getAllByText(/Lord Castellan \[Space Marines\].*\(Record: 1W - 0L\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Commander Farsight \[T'au Empire\].*\(Record: 0W - 1L\)/i).length).toBeGreaterThan(0);
    });

    // Verify simulated algorithm pairings display faction and win-loss record
    const simulateBtn = screen.getByRole('button', { name: /Simulate Pairings via Algorithm/i });
    fireEvent.click(simulateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Proposed Round Ledgers/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Lord Castellan/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\[Space Marines\]/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\(Record: 1W - 0L\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Deployed War Zone:/i).length).toBeGreaterThan(0);
    });
  });
  it('flags a dropped commander\u2019s pairings for reassignment instead of deleting them', async () => {
    // Deleting the row took the *opponent's* frontline with it, silently
    // stripping an active commander of their Phase 2 assignment.
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'admin_123', email: 'omarpatel123@gmail.com' } }
    });

    const matchupUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ or: vi.fn().mockResolvedValue({ error: null }) }),
    });
    const matchupDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ or: vi.fn().mockResolvedValue({ error: null }) }),
    });

    const customMockFrom = (table: string) => {
      if (table === 'profiles') {
        const chainable = Promise.resolve({
          data: [{ id: 'quitter', commander_name: 'Deserter Prime', campaign_status: 'active' }],
          error: null,
        }) as any;
        chainable.eq = vi.fn().mockReturnValue(chainable);
        chainable.single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
        chainable.order = vi.fn().mockReturnValue(chainable);
        return {
          select: vi.fn().mockReturnValue(chainable),
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }
      if (table === 'matchups') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          update: matchupUpdate,
          delete: matchupDelete,
        };
      }
      return mockFromUnlocked(table);
    };
    (supabase.from as import('vitest').Mock).mockImplementation(customMockFrom);

    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getAllByText(/Deserter Prime/i).length).toBeGreaterThan(0));

    fireEvent.click(screen.getByRole('button', { name: /^Pause$/i }));
    await waitFor(() => expect(screen.getByText(/Pause Player\?/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /^Confirm$/i }));

    await waitFor(() => {
      expect(matchupUpdate).toHaveBeenCalledWith({ needs_reassignment: true });
    });
    // The pairing must survive so the opponent keeps a visible frontline.
    expect(matchupDelete).not.toHaveBeenCalled();
  });
  it('records an uncontested frontline so a stranded commander can still report', async () => {
    // Restores a frontline whose opponent dropped out: the pairing is created
    // pre-flagged so Player 1 sees the uncontested claim flow.
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'admin_123', email: 'omarpatel123@gmail.com' } }
    });

    const matchupInsert = vi.fn().mockResolvedValue({ error: null });
    const customMockFrom = (table: string) => {
      if (table === 'profiles') {
        const chainable = Promise.resolve({
          data: [
            { id: 'stranded', commander_name: 'Malakas the Dissonant', army_faction: 'Chaos Space Marines', campaign_status: 'active' },
            { id: 'quitter', commander_name: 'Deserter Prime', army_faction: 'Orks', campaign_status: 'removed' },
          ],
          error: null,
        }) as any;
        chainable.eq = vi.fn().mockReturnValue(chainable);
        chainable.single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
        chainable.order = vi.fn().mockReturnValue(chainable);
        return {
          select: vi.fn().mockReturnValue(chainable),
          update: vi.fn().mockReturnValue({ in: vi.fn().mockResolvedValue({ error: null }), eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }
      if (table === 'matchups') {
        return {
          select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          insert: matchupInsert,
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ or: vi.fn().mockResolvedValue({ error: null }) }) }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }
      return mockFromUnlocked(table);
    };
    (supabase.from as import('vitest').Mock).mockImplementation(customMockFrom);

    const { container } = render(<AdminDashboard />);
    await waitFor(() => expect(screen.getAllByText(/Malakas the Dissonant/i).length).toBeGreaterThan(0));

    // A removed commander is not selectable as an opponent by default.
    const selects = container.querySelectorAll('#manual-narrative-pairing-section select');
    const p2Select = selects[1] as HTMLSelectElement;
    expect(p2Select.textContent).not.toMatch(/Deserter Prime/);

    // Flagging the opponent as withdrawn makes them selectable.
    fireEvent.click(screen.getByRole('checkbox', { name: /has withdrawn/i }));
    await waitFor(() => expect(p2Select.textContent).toMatch(/Deserter Prime/));
    expect(p2Select.textContent).toMatch(/\[WITHDRAWN\]/);

    fireEvent.change(selects[0] as HTMLSelectElement, { target: { value: 'stranded' } });
    fireEvent.change(p2Select, { target: { value: 'quitter' } });
    fireEvent.click(screen.getByRole('button', { name: /Record Uncontested Frontline/i }));

    await waitFor(() => {
      expect(matchupInsert).toHaveBeenCalled();
      const [row] = matchupInsert.mock.calls[0][0];
      expect(row.p1_id).toBe('stranded');
      expect(row.p2_id).toBe('quitter');
      expect(row.needs_reassignment).toBe(true);
      expect(row.status).toBe('scheduled');
    });
  });
  it('grants a bye frontline in one click to a commander whose opponent dropped', async () => {
    // The original pairing was deleted, so there is no opponent left to name.
    // A bye (p2_id null) gives the stranded commander something to claim.
    (supabase.auth.getUser as import('vitest').Mock).mockResolvedValue({
      data: { user: { id: 'admin_123', email: 'omarpatel123@gmail.com' } }
    });

    const matchupInsert = vi.fn().mockResolvedValue({ error: null });
    const customMockFrom = (table: string) => {
      if (table === 'profiles') {
        const chainable = Promise.resolve({
          data: [{ id: 'stranded', commander_name: 'Malakas the Dissonant', army_faction: 'Chaos Space Marines', campaign_status: 'active' }],
          error: null,
        }) as any;
        chainable.eq = vi.fn().mockReturnValue(chainable);
        chainable.single = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
        chainable.order = vi.fn().mockReturnValue(chainable);
        return {
          select: vi.fn().mockReturnValue(chainable),
          update: vi.fn().mockReturnValue({ in: vi.fn().mockResolvedValue({ error: null }), eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }
      if (table === 'matchups') {
        return {
          select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          insert: matchupInsert,
          update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ or: vi.fn().mockResolvedValue({ error: null }) }) }),
          delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        };
      }
      return mockFromUnlocked(table);
    };
    (supabase.from as import('vitest').Mock).mockImplementation(customMockFrom);

    render(<AdminDashboard />);
    await waitFor(() => expect(screen.getAllByText(/Malakas the Dissonant/i).length).toBeGreaterThan(0));

    // The unassigned row offers the grant directly — no opponent to look up.
    fireEvent.click(screen.getByRole('button', { name: /Grant Uncontested/i }));

    await waitFor(() => {
      expect(matchupInsert).toHaveBeenCalled();
      const [row] = matchupInsert.mock.calls[0][0];
      expect(row.p1_id).toBe('stranded');
      expect(row.p2_id).toBeNull();
      expect(row.needs_reassignment).toBe(true);
      expect(row.status).toBe('scheduled');
    });
  });
});
