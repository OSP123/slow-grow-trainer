import React, { useState, useEffect } from 'react';

interface VoxAudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  src: string;
}

export default function VoxAudioPlayer({ audioRef, isPlaying, setIsPlaying, src }: VoxAudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, setIsPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playRes = audio.play();
      if (playRes && typeof playRes.catch === 'function') {
        playRes.catch(e => console.error("Audio playback error:", e));
      }
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "00:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#030803',
      border: '1px solid #1a3a1a',
      borderRadius: '4px',
      fontFamily: 'monospace',
      boxShadow: 'inset 0 0 10px rgba(34, 197, 94, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: '#4ade80',
        marginBottom: '0.75rem',
        letterSpacing: '1px',
        borderBottom: '1px dashed #1a3a1a',
        paddingBottom: '0.5rem'
      }}>
        <span>VOX DECRYPTION PLAYBACK // SIGNAL LOCKED</span>
        <span style={{ color: isPlaying ? '#22c55e' : '#86efac', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isPlaying ? '#22c55e' : '#4ade80',
            boxShadow: isPlaying ? '0 0 6px #22c55e' : 'none',
            display: 'inline-block'
          }} />
          {isPlaying ? 'ACTIVE' : 'READY'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <button
          onClick={togglePlay}
          style={{
            backgroundColor: isPlaying ? '#166534' : '#0a1a0a',
            color: '#4ade80',
            border: '1px solid #22c55e',
            borderRadius: '3px',
            padding: '0.4rem 0.8rem',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: isPlaying ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          {isPlaying ? '⏸ HOLD SIGNAL' : '▶ ACTIVATE FEED'}
        </button>

        <div style={{ fontSize: '0.85rem', color: '#4ade80', letterSpacing: '1px' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Interactive Seek Bar */}
      <div
        onClick={handleSeek}
        style={{
          height: '12px',
          backgroundColor: '#0a140a',
          border: '1px solid #1a3a1a',
          borderRadius: '2px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        title="Click to seek"
      >
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: '#22c55e',
          boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
          transition: 'width 0.1s linear'
        }} />
      </div>

      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      >
        <source src={src} type="audio/mp4" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
