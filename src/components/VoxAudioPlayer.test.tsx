import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import VoxAudioPlayer from './VoxAudioPlayer';

describe('VoxAudioPlayer Component', () => {
  it('renders custom retro auspex controls and time display', () => {
    const audioRef = React.createRef<HTMLAudioElement>();
    const setIsPlaying = vi.fn();
    render(
      <VoxAudioPlayer
        audioRef={audioRef}
        isPlaying={false}
        setIsPlaying={setIsPlaying}
        src="/test-vox.m4a"
      />
    );

    expect(screen.getByText(/VOX DECRYPTION PLAYBACK/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACTIVATE FEED/i })).toBeInTheDocument();
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });

  it('calls play/pause when the custom control button is clicked', () => {
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const audioRef = React.createRef<HTMLAudioElement>();
    const setIsPlaying = vi.fn();

    const { rerender } = render(
      <VoxAudioPlayer
        audioRef={audioRef}
        isPlaying={false}
        setIsPlaying={setIsPlaying}
        src="/test-vox.m4a"
      />
    );

    const playBtn = screen.getByRole('button', { name: /ACTIVATE FEED/i });
    fireEvent.click(playBtn);
    expect(playSpy).toHaveBeenCalled();
    expect(setIsPlaying).toHaveBeenCalledWith(true);

    rerender(
      <VoxAudioPlayer
        audioRef={audioRef}
        isPlaying={true}
        setIsPlaying={setIsPlaying}
        src="/test-vox.m4a"
      />
    );
    const pauseBtn = screen.getByRole('button', { name: /HOLD SIGNAL/i });
    fireEvent.click(pauseBtn);
    expect(pauseSpy).toHaveBeenCalled();
    expect(setIsPlaying).toHaveBeenCalledWith(false);

    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });
});
