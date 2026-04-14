import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdatePassword from './UpdatePassword';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

describe('Update Password Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gracefully', () => {
    render(<UpdatePassword setIsRecovering={vi.fn()} />);
    expect(screen.getByPlaceholderText(/New Security Code/i)).toBeInTheDocument();
  });

  it('submits new password to supabase successfully', async () => {
    (supabase.auth.updateUser as import("vitest").Mock).mockResolvedValue({ error: null });
    const mockSetIsRecovering = vi.fn();

    render(<UpdatePassword setIsRecovering={mockSetIsRecovering} />);
    
    const passwordInput = screen.getByPlaceholderText(/New Security Code/i);
    fireEvent.change(passwordInput, { target: { value: 'superior_password' } });

    const submitBtn = screen.getByRole('button', { name: /Establish New Code/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'superior_password' });
    });
  });
});
