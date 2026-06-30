import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VoxWaveform from './VoxWaveform';

describe('VoxWaveform Component', () => {
  it('renders standby status and oscillograph display when audio is paused', () => {
    render(<VoxWaveform isPlaying={false} />);
    expect(screen.getByText(/STATUS: CARRIER WAVE STANDBY/i)).toBeInTheDocument();
    expect(screen.getByText(/AUSPEX FREQUENCY ANALYSER/i)).toBeInTheDocument();
    expect(screen.getByTestId('waveform-container')).toBeInTheDocument();
  });

  it('renders live transmitting status when audio is playing', () => {
    render(<VoxWaveform isPlaying={true} />);
    expect(screen.getByText(/STATUS: TRANSMITTING \/\/ SPECTRUM LIVE/i)).toBeInTheDocument();
  });

  it('accepts an audioRef for real-time Web Audio API frequency analysis', () => {
    const audioEl = document.createElement('audio');
    const audioRef = { current: audioEl };
    render(<VoxWaveform isPlaying={true} audioRef={audioRef} />);
    expect(screen.getByText(/STATUS: TRANSMITTING \/\/ SPECTRUM LIVE/i)).toBeInTheDocument();
  });

  it('renders continuous SVG waveform paths instead of equalizer bars', () => {
    const { container } = render(<VoxWaveform isPlaying={true} />);
    const svgEl = container.querySelector('svg');
    expect(svgEl).toBeInTheDocument();
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });
});
