import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Assessments from './Assessments';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'voter-uuid' } } })
    }
  },
}));

describe('Officer Assessment (Voting Module)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    (supabase.from as import("vitest").Mock).mockReturnValue({ select: mockSelect });
  });

  it('renders voting categories successfully without injecting mock opponents', async () => {
    render(<Assessments />);

    // Assert the four core categories exist
    expect(screen.getByText(/Best Painted/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Conversion/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Lore/i)).toBeInTheDocument();
    expect(screen.getByText(/Best Sportsmanship/i)).toBeInTheDocument();
  });

  it('submits a valid vote to the campaign_votes table', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 'test-opponent-uuid', commander_name: 'Leman Russ' }], error: null });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    
    (supabase.from as import("vitest").Mock).mockImplementation((table: string) => {
      if (table === 'profiles') return { select: mockSelect };
      if (table === 'campaign_votes') return { insert: mockInsert };
      return {};
    });

    render(<Assessments />);

    // Select Best Sportsmanship
    const categorySelect = screen.getByLabelText(/Award Category/i);
    fireEvent.change(categorySelect, { target: { value: 'best_sportsmanship' } });

    // Wait for async profiles to load into select
    await waitFor(() => {
      expect(screen.getByText(/Leman Russ/i)).toBeInTheDocument();
    });

    // Select Nominee from dropdown instead of manual input
    const nomineeSelect = screen.getByLabelText(/Nominee/i);
    fireEvent.change(nomineeSelect, { target: { value: 'test-opponent-uuid' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Official Vote/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('campaign_votes');
      expect(mockInsert).toHaveBeenCalledWith({
        voter_id: 'voter-uuid',
        nominee_id: 'test-opponent-uuid',
        category: 'best_sportsmanship'
      });
    });
  });
});
