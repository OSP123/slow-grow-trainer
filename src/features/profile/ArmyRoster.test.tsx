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

const mockUnits = [
  { id: 'unit-1', unit_name: 'Intercessor Squad', faction: 'Space Marines', model_count: 5, points: 80, built: true, painted: false, played: false, notes: null },
  { id: 'unit-2', unit_name: 'Infantry Squad', faction: 'Astra Militarum', model_count: 10, points: 60, built: false, painted: false, played: false, notes: 'Magnetized' },
];

describe('ArmyRoster', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
      expect(screen.getByText('Infantry Squad')).toBeInTheDocument();
    });
  });

  it('shows Astra Militarum in the faction dropdown', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => screen.getByText('Infantry Squad'));
    // First combobox is the faction select
    const selects = screen.getAllByRole('combobox');
    const factionSelect = selects[0];
    // Faction options should include Astra Militarum
    expect(factionSelect.innerHTML).toContain('Astra Militarum');
    // Should NOT contain garbage entries from the old API
    expect(factionSelect.innerHTML).not.toContain('Library');
    expect(factionSelect.innerHTML).not.toContain('Aeldari Library');
  });

  it('shows factional grouping by grand alliance', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => screen.getByText('Infantry Squad'));
    const factionSelect = screen.getAllByRole('combobox')[0];
    expect(factionSelect.innerHTML).toContain('Imperium');
    expect(factionSelect.innerHTML).toContain('Chaos');
    expect(factionSelect.innerHTML).toContain('Xenos');
  });

  it('shows progress bars when units exist', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={true} />);
    await waitFor(() => {
      expect(screen.getByText('Intercessor Squad')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Built/i).length).toBeGreaterThan(0);
    // Summary line: 5 + 10 = 15 models
    expect(screen.getByText(/15 models/i)).toBeInTheDocument();
  });

  it('shows read-only view for non-owners (no remove buttons)', async () => {
    render(<ArmyRoster profileId="profile-123" isOwner={false} />);
    await waitFor(() => {
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      expect(screen.queryByText(/Muster Unit/i)).not.toBeInTheDocument();
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
