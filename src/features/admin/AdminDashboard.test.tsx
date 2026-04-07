import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('AdminDashboard (RBAC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects users without the root admin email', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { email: 'standard_commander@admin.com' } }
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/UNAUTHORIZED: Clearance Denied/i)).toBeInTheDocument();
    });
  });

  it('presents the security gateway to the root email', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { email: 'omarpatel123@gmail.com' } }
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter Admin Override Code/i)).toBeInTheDocument();
    });
  });

  it('reveals the tally logic when correct administrative code is provided', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { email: 'omarpatel123@gmail.com' } }
    });

    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    (supabase.from as any).mockReturnValue({ select: mockSelect });

    render(<AdminDashboard />);

    await waitFor(() => {
      const codeInput = screen.getByPlaceholderText(/Enter Admin Override Code/i);
      fireEvent.change(codeInput, { target: { value: 'TERMINUS_ROOT' } });
      const submitBtn = screen.getByRole('button', { name: /Unlock Root Access/i });
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Campaign Voting Tallies/i)).toBeInTheDocument();
      expect(supabase.from).toHaveBeenCalledWith('campaign_votes');
    });
  });
});
