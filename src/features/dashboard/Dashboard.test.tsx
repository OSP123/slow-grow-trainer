import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { supabase } from '../../supabaseClient';

// Mock Supabase to return specific payload states based on test conditions
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Dashboard (Megafactions War Effort Map)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty state if no real data is found (Strict NO MOCK DATA rule)', async () => {
    // Mock the query to return empty data
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    (supabase.from as import("vitest").Mock).mockReturnValue({ select: mockSelect });

    render(<Dashboard />);

    // Fast assertion for empty state
    expect(await screen.findByText(/No telemetry data available/i)).toBeInTheDocument();
    
    // Ensure no default zero scores or fake numbers exist
    expect(screen.queryByText(/2\.0/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Imperium: 0/i)).not.toBeInTheDocument();
  });

  it('renders the scores fetched from the database successfully', async () => {
    const mockScores = [
      { mega_faction: 'imperium', score: 154 },
      { mega_faction: 'chaos', score: 120 },
      { mega_faction: 'xenos', score: 198 }
    ];

    const mockSelect = vi.fn().mockResolvedValue({ data: mockScores, error: null });
    (supabase.from as import("vitest").Mock).mockReturnValue({ select: mockSelect });

    render(<Dashboard />);

    // Assert it eventually loads the real data and displays it
    await waitFor(() => {
      expect(screen.getByText(/imperium:/i)).toBeInTheDocument();
      expect(screen.getByText(/154/i)).toBeInTheDocument();
      expect(screen.getByText(/chaos:/i)).toBeInTheDocument();
      expect(screen.getByText(/120/i)).toBeInTheDocument();
      expect(screen.getByText(/xenos:/i)).toBeInTheDocument();
      expect(screen.getByText(/198/i)).toBeInTheDocument();
    });
  });
});
