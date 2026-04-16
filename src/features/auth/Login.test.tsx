import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';
import { supabase } from '../../supabaseClient';

// Mock Supabase to track sign in calls
vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [{ id: 'store-123', name: 'Warhammer Citadel' }] })
      })
    }),
  },
}));

describe('Login Component', () => {
  it('renders login form elements successfully', () => {
    render(<Login />);
    
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Deploy/i })).toBeInTheDocument();
  });

  it('calls Supabase auth on submit', async () => {
    render(<Login />);
    
    // Fill out the form
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const button = screen.getByRole('button', { name: /Deploy/i });

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

  it('handles user registration (sign up) locally', async () => {
    render(<Login />);

    // Toggle to Sign Up view
    const signUpToggle = screen.getByText(/Create an Account/i);
    fireEvent.click(signUpToggle);

    // Verify title change
    expect(screen.getByRole('heading', { name: /New Commander Registration/i })).toBeInTheDocument();

    // Fill out registration form
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const realNameInput = screen.getByPlaceholderText(/Real Name/i);
    const cmdNameInput = screen.getByPlaceholderText(/Commander Name/i);
    const discordInput = screen.getByPlaceholderText(/Discord Handle/i);
    const locationInput = screen.getByPlaceholderText(/Your Location/i);
    const factionSelect = screen.getByLabelText(/Army Core Faction/i);
    const subfactionSelect = screen.getByLabelText(/Army Subfaction/i);
    const storeSelect = screen.getByLabelText(/Preferred Game Store/i);
    // Wait for Game Stores API fetch to populate options natively
    await waitFor(() => {
      expect(screen.getByText(/Warhammer Citadel/i)).toBeInTheDocument();
    });

    fireEvent.change(emailInput, { target: { value: 'newplayer@admin.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword123' } });
    fireEvent.change(realNameInput, { target: { value: 'Leman Russ' } });
    fireEvent.change(cmdNameInput, { target: { value: 'WolfKing' } });
    fireEvent.change(discordInput, { target: { value: 'leman_russ#1234' } });
    fireEvent.change(locationInput, { target: { value: 'Fenris' } });
    fireEvent.change(factionSelect, { target: { value: 'Space Marines' } });
    fireEvent.change(subfactionSelect, { target: { value: 'Space Wolves' } });
    fireEvent.change(storeSelect, { target: { value: 'store-123' } });

    // Submit
    const registerBtn = screen.getByRole('button', { name: /Register/i });
    fireEvent.click(registerBtn);

    // Assert the mocked supabase function was called with meta-data
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newplayer@admin.com',
        password: 'securepassword123',
        options: {
          emailRedirectTo: expect.any(String),
          data: {
            real_name: 'Leman Russ',
            commander_name: 'WolfKing',
            discord_name: 'leman_russ#1234',
            location: 'Fenris',
            experience_level: 'beginner',
            army_faction: 'Space Marines',
            army_subfaction: 'Space Wolves',
            preferred_store_id: 'store-123'
          }
        }
      });
    });
  });
});
