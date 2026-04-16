import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CommanderProfile from './CommanderProfile';
import { supabase } from '../../supabaseClient';
import type { Mock } from 'vitest';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    storage: { from: vi.fn() },
  }
}));

// Mock ArmyRoster to isolate CommanderProfile tests
vi.mock('./ArmyRoster', () => ({
  default: () => <div>ArmyRoster Mock</div>,
}));

const mockProfile = {
  id: 'profile-123',
  commander_name: 'Lord Castellan',
  army_lore: 'We march for the Emperor.',
  avatar_url: '',
  location: 'Los Angeles',
  army_faction: 'Space Marines',
  army_subfaction: 'Blood Angels',
  preferred_store_id: 'store-1',
};

function renderProfile(profileId?: string) {
  return render(
    <MemoryRouter initialEntries={[profileId ? `/profile/${profileId}` : '/profile']}>
      <Routes>
        <Route path="/profile" element={<CommanderProfile />} />
        <Route path="/profile/:profileId" element={<CommanderProfile />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CommanderProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: { id: 'profile-123', email: 'test@example.com', user_metadata: {} } }
    });

    (supabase.from as Mock).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
          upsert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }) }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }
      if (table === 'game_stores') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [{ id: 'store-1', name: 'Battlefront Games' }], error: null }),
          }),
        };
      }
      return {};
    });
  });

  it('shows loading state initially', () => {
    renderProfile();
    expect(screen.getByText(/Downloading Profile/i)).toBeInTheDocument();
  });

  it('renders commander name and tabs after load', async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText(/Lord Castellan/i)).toBeInTheDocument();
      expect(screen.getByText('Commander Specs')).toBeInTheDocument();
      expect(screen.getByText('Army Roster')).toBeInTheDocument();
      expect(screen.getByText('Army Chronicles')).toBeInTheDocument();
    });
  });

  it('shows specs by default with faction info', async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText('Space Marines')).toBeInTheDocument();
    });
  });

  it('switches to roster tab and renders ArmyRoster', async () => {
    renderProfile();
    await waitFor(() => screen.getByText('Army Roster'));
    fireEvent.click(screen.getByText('Army Roster'));
    await waitFor(() => {
      expect(screen.getByText('ArmyRoster Mock')).toBeInTheDocument();
    });
  });

  it('switches to lore tab and shows lore text', async () => {
    renderProfile();
    await waitFor(() => screen.getByText('Army Chronicles'));
    fireEvent.click(screen.getByText('Army Chronicles'));
    await waitFor(() => {
      expect(screen.getByText(/We march for the Emperor/i)).toBeInTheDocument();
    });
  });
});
