import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import { supabase } from '../../supabaseClient';

// Mock Supabase to track sign in calls
vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('Login Component', () => {
  it('renders login form elements successfully', () => {
    render(<Login />);
    
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Engage/i })).toBeInTheDocument();
  });

  it('calls Supabase auth on submit', async () => {
    render(<Login />);
    
    // Fill out the form
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const button = screen.getByRole('button', { name: /Engage/i });

    fireEvent.change(emailInput, { target: { value: 'test@admin.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(button);

    // Assert the mocked supabase function was called
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@admin.com',
      password: 'password123',
    });
  });

  it('handles forgot password flow smoothly', async () => {
    render(<Login />);

    // Toggle forgot password view
    const forgotBtn = screen.getByText(/Forgot Password\?/i);
    fireEvent.click(forgotBtn);

    // Verify view has swapped (Password field is gone)
    expect(screen.queryByPlaceholderText(/Password/i)).not.toBeInTheDocument();
    
    // Fill out recovery email
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'recover@admin.com' } });

    // Submit recovery
    const sendBtn = screen.getByRole('button', { name: /Send Recovery Link/i });
    fireEvent.click(sendBtn);

    // Assert supabase reset call
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('recover@admin.com');
  });
});
