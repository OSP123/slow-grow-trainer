import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TacticalSectorMap, { getFactionColor } from './TacticalSectorMap';

describe('TacticalSectorMap & Helper Tests', () => {
  describe('getFactionColor', () => {
    it('returns megafaction colors correctly', () => {
      expect(getFactionColor('Adeptus Astartes', 'Imperium')).toBe('#3b82f6');
      expect(getFactionColor('Chaos Space Marines', 'Chaos')).toBe('#ef4444');
    });

    it('returns individual Xenos faction colors correctly', () => {
      expect(getFactionColor('Orks', 'Xenos')).toBe('#22c55e');
      expect(getFactionColor('Necrons', 'Xenos')).toBe('#10b981');
      expect(getFactionColor('Tyranids', 'Xenos')).toBe('#a855f7');
      expect(getFactionColor("T'au Empire", 'Xenos')).toBe('#f97316');
      expect(getFactionColor('Aeldari', 'Xenos')).toBe('#06b6d4');
      expect(getFactionColor('Drukhari', 'Xenos')).toBe('#14b8a6');
      expect(getFactionColor('Leagues of Votann', 'Xenos')).toBe('#eab308');
      expect(getFactionColor('Genestealer Cults', 'Xenos')).toBe('#d946ef');
    });

    it('returns neutral gray for missing or unknown faction', () => {
      expect(getFactionColor()).toBe('#4b5563');
    });
  });

  describe('TacticalSectorMap Component', () => {
    const mockTheatre = {
      name: 'The Hive Spires',
      narrative: 'Test narrative',
      color: '#3b82f6'
    };

    const mockCommanders = [
      { id: 'cmd-1', commander_name: 'Ghazghkull', army_faction: 'Orks', deployed_theatre: 'The Hive Spires' },
      { id: 'cmd-2', commander_name: 'Farsight', army_faction: "T'au Empire", deployed_theatre: 'The Hive Spires' }
    ];

    it('renders header and tap instruction', () => {
      render(<TacticalSectorMap theatre={mockTheatre} commanders={mockCommanders} mapLocations={[]} />);
      expect(screen.getByText('AUSPEX TACTICAL DISPLAY // THE HIVE SPIRES')).toBeInTheDocument();
      expect(screen.getByText('TAP A SECTOR TO VIEW TACTICAL TELEMETRY')).toBeInTheDocument();
    });

    it('renders 5 sectors per theatre (one per escalation round)', () => {
      const { container } = render(<TacticalSectorMap theatre={mockTheatre} commanders={mockCommanders} mapLocations={[]} />);
      const polygons = container.querySelectorAll('svg polygon');
      expect(polygons.length).toBe(5);
    });

    it('shows round and points labels for each sector', () => {
      render(<TacticalSectorMap theatre={mockTheatre} commanders={mockCommanders} mapLocations={[]} />);
      expect(screen.getByText('RND 1 // 400 PTS')).toBeInTheDocument();
      expect(screen.getByText('RND 3 // 1200 PTS')).toBeInTheDocument();
      expect(screen.getByText('RND 5 // 2000 PTS')).toBeInTheDocument();
    });

    it('renders unique sector names for The Hive Spires (horizontal bands)', () => {
      render(<TacticalSectorMap theatre={mockTheatre} commanders={mockCommanders} mapLocations={[]} />);
      expect(screen.getByText('Outer Wall')).toBeInTheDocument();
      expect(screen.getByText('Hab Districts')).toBeInTheDocument();
      expect(screen.getByText('Spire Apex')).toBeInTheDocument();
    });

    it('renders completely different sector names for The Ash Wastes (diagonal slashes)', () => {
      const ashWastes = { name: 'The Ash Wastes', narrative: 'Test', color: '#f97316' };
      render(<TacticalSectorMap theatre={ashWastes} commanders={[]} mapLocations={[]} />);
      expect(screen.getByText('Rad Perimeter')).toBeInTheDocument();
      expect(screen.getByText('Storm Corridor')).toBeInTheDocument();
      expect(screen.getByText('Dead Zone')).toBeInTheDocument();
    });

    it('renders completely different sector names for Orbital Relay Station (radial wedges)', () => {
      const orbital = { name: 'Orbital Relay Station', narrative: 'Test', color: '#06b6d4' };
      render(<TacticalSectorMap theatre={orbital} commanders={[]} mapLocations={[]} />);
      expect(screen.getByText('Docking Pylons')).toBeInTheDocument();
      expect(screen.getByText('Weapons Battery')).toBeInTheDocument();
      expect(screen.getByText('Command Bridge')).toBeInTheDocument();
    });

    it('displays sector telemetry on click/tap', () => {
      render(<TacticalSectorMap theatre={mockTheatre} commanders={mockCommanders} mapLocations={[]} />);

      const sectorLabel = screen.getByText('Outer Wall');
      const sectorGroup = sectorLabel.closest('g');
      if (sectorGroup) {
        fireEvent.click(sectorGroup);
      }

      expect(screen.getByText(/RND 1 — OUTER WALL \(400 PTS\)/)).toBeInTheDocument();
      expect(screen.getByText(/DOMINANCE:/)).toBeInTheDocument();
    });

    it('deselects sector when tapping the same sector again', () => {
      render(<TacticalSectorMap theatre={mockTheatre} commanders={mockCommanders} mapLocations={[]} />);

      const sectorLabel = screen.getByText('Outer Wall');
      const sectorGroup = sectorLabel.closest('g');
      if (sectorGroup) {
        fireEvent.click(sectorGroup);
        expect(screen.getByText(/RND 1 — OUTER WALL/)).toBeInTheDocument();
        fireEvent.click(sectorGroup);
        expect(screen.getByText('TAP A SECTOR TO VIEW TACTICAL TELEMETRY')).toBeInTheDocument();
      }
    });

    it('all 6 theatres produce exactly 5 polygons each', () => {
      const theatres = [
        { name: 'The Hive Spires', color: '#3b82f6' },
        { name: 'The Ash Wastes', color: '#f97316' },
        { name: 'The Magma Forges', color: '#ef4444' },
        { name: 'Orbital Relay Station', color: '#06b6d4' },
        { name: 'The Sump Ruins', color: '#a855f7' },
        { name: 'The Toxic Oceans', color: '#22c55e' },
      ];

      theatres.forEach(t => {
        const { container, unmount } = render(
          <TacticalSectorMap theatre={{ ...t, narrative: 'test' }} commanders={[]} mapLocations={[]} />
        );
        const polygons = container.querySelectorAll('svg polygon');
        expect(polygons.length).toBe(5);
        unmount();
      });
    });

    it('falls back to default sectors for unknown theatre', () => {
      const unknown = { name: 'Unknown Place', narrative: 'Test', color: '#aaa' };
      render(<TacticalSectorMap theatre={unknown} commanders={[]} mapLocations={[]} />);
      expect(screen.getByText('Sector Alpha')).toBeInTheDocument();
      expect(screen.getByText('Sector Epsilon')).toBeInTheDocument();
    });
  });
});
