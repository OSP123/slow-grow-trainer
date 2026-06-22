import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getAllByText(/Vespera Prime/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Forces Deployed/i)).toBeInTheDocument();
      expect(screen.getByText(/Sector Command Roster/i)).toBeInTheDocument();
    });
  });
});
