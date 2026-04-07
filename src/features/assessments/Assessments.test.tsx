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
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ insert: mockInsert });

    render(<Assessments />);

    // Select Best Sportsmanship
    const categorySelect = screen.getByLabelText(/Award Category/i);
    fireEvent.change(categorySelect, { target: { value: 'best_sportsmanship' } });

    // Enter a Nominee UUID string (respecting no mock data, user types literal string ID for now)
    const nomineeInput = screen.getByLabelText(/Nominee/i);
    fireEvent.change(nomineeInput, { target: { value: 'test-opponent-uuid' } });

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
