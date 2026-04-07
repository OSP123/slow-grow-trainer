import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock Supabase auth session
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
  },
}));

describe('App Routing & Auth', () => {
  it('renders the Login screen by default if no session exists', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Test should pass because without session, the Login component text "Secure Access" should appear.
    // Our TDD currently expects it to immediately prompt for login.
    expect(await screen.findByText(/Secure Access/i)).toBeInTheDocument();
  });
});
