import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { supabase } from '../../supabaseClient';

const createMockChain = (resolvedValue: any) => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    maybeSingle: vi.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve(resolvedValue).then(resolve)
  };
  return chain;
};

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } })
    }
  },
}));

vi.mock('react-globe.gl', () => ({
  default: () => <div data-testid="mock-globe">Globe</div>
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully after fetching telemetry', async () => {
    (supabase.from as import("vitest").Mock).mockReturnValue(createMockChain({ data: [], error: null }));

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getAllByText(/Vespera Prime/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Forces Deployed/i)).toBeInTheDocument();
      expect(screen.getByText(/Sector Command Roster/i)).toBeInTheDocument();
    });
  });

  it('renders active campaign matchup banner when logged in user has an active mission', async () => {
    (supabase.auth.getUser as import("vitest").Mock).mockResolvedValue({
      data: { user: { id: 'user-1' } }
    });

    (supabase.from as import("vitest").Mock).mockImplementation((table: string) => {
      if (table === 'matchups') {
        return createMockChain({
          data: [{
            id: 'm-100',
            status: 'active',
            game_result: null,
            p1_id: 'user-1',
            p2_id: 'user-2',
            theatre_name: 'The Hive Spires',
            p1_profile: { commander_name: 'Patel', army_faction: 'Imperium' },
            p2_profile: { commander_name: 'Abaddon', army_faction: 'Chaos Space Marines' }
          }],
          error: null
        });
      }
      return createMockChain({ data: [], error: null });
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/YOUR CURRENT CAMPAIGN MISSION/i)).toBeInTheDocument();
      expect(screen.getByText(/VS Abaddon/i)).toBeInTheDocument();
    });
  });

  it('organizes sector command roster into Imperial Forces, Chaos Forces, and Xenos Forces sections', async () => {
    (supabase.from as import("vitest").Mock).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return createMockChain({
          data: [
            { id: 'c-1', commander_name: 'Guilliman', army_faction: 'Adeptus Astartes', campaign_status: 'active' },
            { id: 'c-2', commander_name: 'Mortarion', army_faction: 'Death Guard', campaign_status: 'active' },
            { id: 'c-3', commander_name: 'Swarm Lord', army_faction: 'Tyranids', campaign_status: 'active' }
          ],
          error: null
        });
      }
      return createMockChain({ data: [], error: null });
    });

    render(<MemoryRouter><Dashboard /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Imperial Forces/i)).toBeInTheDocument();
      expect(screen.getByText(/Chaos Forces/i)).toBeInTheDocument();
      expect(screen.getByText(/Xenos Forces/i)).toBeInTheDocument();
      expect(screen.getByText('Guilliman')).toBeInTheDocument();
      expect(screen.getByText('Mortarion')).toBeInTheDocument();
      expect(screen.getByText('Swarm Lord')).toBeInTheDocument();
    });
  });
});
