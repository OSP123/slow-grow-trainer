import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CommanderProfile from './CommanderProfile';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    }
  }
}));

describe('CommanderProfile Component Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a ghost profile gracefully and renders without throwing HTTP 403', async () => {
    // 1. Mock Auth
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'ghost-123', email: 'test@ghost.com' } }
    });

    // 2. Mock missing profile fetch (maybeSingle returns null)
    const selectMock = vi.fn().mockImplementation(() => ({
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ 
        data: { id: 'ghost-123', commander_name: 'Rescued Ghost' }, 
        error: null 
      })
    }));

    const insertMock = vi.fn().mockImplementation(() => ({
      select: selectMock
    }));

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return { select: selectMock, insert: insertMock, update: vi.fn() };
      }
      return {};
    });

    render(<CommanderProfile />);

    // Validate Loading State explicitly
    expect(screen.getByText(/Downloading Profile/i)).toBeInTheDocument();

    // Verify it drops into auto-rescue natively and bypasses the UI crash
    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
        id: 'ghost-123',
        email: 'test@ghost.com'
      }));
    });

    // Validates that the UI eventually maps the successfully created ghost profile
    await waitFor(() => {
      expect(screen.getByText(/Commander Rescued Ghost/i)).toBeInTheDocument();
    });
  });
});
