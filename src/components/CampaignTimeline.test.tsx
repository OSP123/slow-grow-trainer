import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CampaignTimeline from './CampaignTimeline';

describe('CampaignTimeline Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders countdown timer when campaign start date is in the future', () => {
    // Set system time before July 1, 2026
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    render(<CampaignTimeline />);
    expect(screen.getByText(/Time Until Deployment/i)).toBeInTheDocument();
  });

  it('renders vox transmission audio player and transcript when campaign start date has passed', () => {
    // Set system time after July 1, 2026
    vi.setSystemTime(new Date('2026-07-02T12:00:00Z'));
    render(<CampaignTimeline />);
    expect(screen.getAllByText(/INCOMING VOX TRANSMISSION/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/SOURCE ID: Planetary Governer Silvanus Petro/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Inquisitor Charmeleus Kane/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/AUSPEX FREQUENCY ANALYSER/i)).toBeInTheDocument();
  });
});
