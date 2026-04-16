import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ArmyRoster from './ArmyRoster';
import { supabase } from '../../supabaseClient';
import type { Mock } from 'vitest';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  }
}));

// Mock fetch globally for OpenHammer API calls
vi.stubGlobal('fetch', vi.fn());

const mockUnits = [
  { id: 'unit-1', unit_name: 'Intercessor Squad', faction: 'Space Marines', model_count: 5, points: 80, built: true, painted: false, played: false, notes: null },
  { id: 'unit-2', unit_name: 'Tactical Squad', faction: 'Space Marines', model_count: 10, points: 100, built: false, painted: false, played: false, notes: 'Magnetized' },
];

describe('ArmyRoster', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock failed OpenHammer fetch (graceful fallback)
    (fetch as unknown as import('vitest').Mock).mockRejectedValue(new Error('Network Error'));

    (supabase.from as Mock).mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockUnits, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));
  });

  it('renders roster table with units after load', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
      expect(screen.getByText('Tactical Squad')).toBeInTheDocument();
    });
  });

  it('shows progress bars when units exist', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
    });
    // Progress bars are rendered — verify via total count display
    expect(screen.getByText(/15.*models/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Built/i).length).toBeGreaterThan(0);
  });

  it('shows read-only view for non-owners (no remove buttons)', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={false} />);
    await waitFor(() => {
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      expect(screen.queryByText('+ Add to Roster')).not.toBeInTheDocument();
    });
  });

  it('falls back to manual entry when API fails', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => {
      // With fetch failing, manual input should appear
      expect(screen.getByPlaceholderText(/e.g. Intercessor Squad/i)).toBeInTheDocument();
    });
  });

  it('toggles built status when button clicked', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => screen.getByText('Intercessor Squad'));

    const toggleButtons = screen.getAllByTitle(/Mark as/i);
    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('army_units');
    });
  });
});
