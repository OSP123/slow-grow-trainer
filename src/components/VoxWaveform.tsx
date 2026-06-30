import React, { useState, useEffect } from 'react';

interface VoxWaveformProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
}

export default function VoxWaveform({ isPlaying, audioRef }: VoxWaveformProps) {
  const [primaryPath, setPrimaryPath] = useState<string>('');
  const [secondaryPath, setSecondaryPath] = useState<string>('');
  const [tertiaryPath, setTertiaryPath] = useState<string>('');

  useEffect(() => {
    let animId: number;
    let isConnected = false;

    // Check if real Web Audio API connection can be established
    if (isPlaying && audioRef?.current) {
      const audioEl = audioRef.current;
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        let analyser = (audioEl as any)._analyser as AnalyserNode | undefined;
        let audioCtx = (audioEl as any)._audioCtx as AudioContext | undefined;

        if (!analyser || !audioCtx) {
          try {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            audioCtx = new AudioCtxClass();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256; // 128 time-domain sample points
            const source = audioCtx.createMediaElementSource(audioEl);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            (audioEl as any)._analyser = analyser;
            (audioEl as any)._audioCtx = audioCtx;
          } catch (e) {
            console.warn("Web Audio API connection failed, falling back to simulated carrier waveform:", e);
          }
        }

        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        if (analyser) {
          isConnected = true;
          const bufferLength = analyser.frequencyBinCount; // 128
          const timeData = new Uint8Array(bufferLength);

          const updateRealtimeWaveforms = () => {
            analyser!.getByteTimeDomainData(timeData);

            const numPoints = 80;
            const pts1: string[] = [];
            const pts2: string[] = [];
            const pts3: string[] = [];

            for (let i = 0; i <= numPoints; i++) {
              const x = Math.round((i / numPoints) * 800);
              const sampleIdx = Math.floor((i / numPoints) * (bufferLength - 1));
              const rawVal = timeData[sampleIdx] || 128;
              const norm = (rawVal - 128) / 128; // -1 to 1

              const y1 = Math.round(60 + norm * 52);
              const y2 = Math.round(60 + norm * 34 * Math.cos(i * 0.15));
              const y3 = Math.round(60 + norm * 20 * Math.sin(i * 0.2));

              pts1.push(`${i === 0 ? 'M' : 'L'} ${x} ${y1}`);
              pts2.push(`${i === 0 ? 'M' : 'L'} ${x} ${y2}`);
              pts3.push(`${i === 0 ? 'M' : 'L'} ${x} ${y3}`);
            }

            setPrimaryPath(pts1.join(' '));
            setSecondaryPath(pts2.join(' '));
            setTertiaryPath(pts3.join(' '));

            animId = requestAnimationFrame(updateRealtimeWaveforms);
          };

          updateRealtimeWaveforms();
        }
      }
    }

    if (!isConnected) {
      // Simulation / Standby smooth oscilloscope wave generator
      const updateSimulatedWaveforms = () => {
        const time = Date.now() * 0.004;
        const numPoints = 80;
        const pts1: string[] = [];
        const pts2: string[] = [];
        const pts3: string[] = [];

        for (let i = 0; i <= numPoints; i++) {
          const x = Math.round((i / numPoints) * 800);
          let y1 = 60;
          let y2 = 60;
          let y3 = 60;

          if (isPlaying) {
            y1 = Math.round(60 + Math.sin(i * 0.22 + time * 2.8) * 36 + Math.sin(i * 0.6 - time * 4.2) * 14 + (Math.random() - 0.5) * 8);
            y2 = Math.round(60 + Math.cos(i * 0.18 + time * 2.2) * 24 + Math.sin(i * 0.4 + time * 1.5) * 10);
            y3 = Math.round(60 + Math.sin(i * 0.14 - time * 1.8) * 16);
          } else {
            y1 = Math.round(60 + Math.sin(i * 0.15 + time) * 14 + Math.sin(i * 0.05 + time * 0.5) * 6);
            y2 = Math.round(60 + Math.cos(i * 0.12 + time * 0.8) * 9);
            y3 = Math.round(60 + Math.sin(i * 0.09 - time * 0.6) * 5);
          }

          pts1.push(`${i === 0 ? 'M' : 'L'} ${x} ${y1}`);
          pts2.push(`${i === 0 ? 'M' : 'L'} ${x} ${y2}`);
          pts3.push(`${i === 0 ? 'M' : 'L'} ${x} ${y3}`);
        }

        setPrimaryPath(pts1.join(' '));
        setSecondaryPath(pts2.join(' '));
        setTertiaryPath(pts3.join(' '));

        animId = requestAnimationFrame(updateSimulatedWaveforms);
      };

      updateSimulatedWaveforms();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, audioRef]);

  return (
    <div 
      data-testid="waveform-container"
      style={{
        flexShrink: 0,
        minHeight: '180px',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#030803',
        border: '1px solid #1a3a1a',
        borderRadius: '4px',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontFamily: 'monospace',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 15px rgba(34, 197, 94, 0.15)'
      }}
    >
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: '#4ade80',
        borderBottom: '1px solid #1a3a1a',
        paddingBottom: '0.5rem',
        marginBottom: '0.5rem',
        letterSpacing: '1px'
      }}>
        <span>AUSPEX FREQUENCY ANALYSER // WAVEFORM BAND: 300-3500 HZ</span>
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.35rem',
          color: isPlaying ? '#4ade80' : '#86efac'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isPlaying ? '#22c55e' : '#4ade80',
            boxShadow: isPlaying ? '0 0 8px #22c55e' : '0 0 4px #4ade80',
            display: 'inline-block'
          }} />
          {isPlaying ? 'STATUS: TRANSMITTING // SPECTRUM LIVE' : 'STATUS: CARRIER WAVE STANDBY'}
        </span>
      </div>

      {/* Pure Waveform Oscillograph Display Window */}
      <div style={{
        height: '120px',
        width: '100%',
        position: 'relative',
        backgroundColor: '#020602',
        border: '1px solid #0f2a0f',
        borderRadius: '2px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background Retro Oscilloscope Grid Lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '40px 30px',
          pointerEvents: 'none'
        }} />

        {/* Center horizontal baseline */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: 'rgba(34, 197, 94, 0.35)',
          borderTop: '1px dashed rgba(34, 197, 94, 0.5)',
          pointerEvents: 'none'
        }} />

        {/* Dynamic Multi-Layered SVG Waveforms */}
        <svg width="100%" height="100%" viewBox="0 0 800 120" preserveAspectRatio="none" style={{ position: 'relative', zIndex: 2 }}>
          {/* Tertiary Sub-Carrier Wave */}
          {tertiaryPath && (
            <path
              d={tertiaryPath}
              fill="none"
              stroke="#166534"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.55"
            />
          )}

          {/* Secondary Harmonic Wave */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="#22c55e"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.75"
            />
          )}

          {/* Primary Signal Wave */}
          {primaryPath && (
            <path
              d={primaryPath}
              fill="none"
              stroke={isPlaying ? "#4ade80" : "#22c55e"}
              strokeWidth={isPlaying ? "2.5" : "2"}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                filter: isPlaying ? 'drop-shadow(0 0 6px rgba(74, 222, 128, 0.85))' : 'drop-shadow(0 0 3px rgba(34, 197, 94, 0.4))'
              }}
            />
          )}
        </svg>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.65rem',
        color: '#166534',
        marginTop: '0.4rem',
        letterSpacing: '1px'
      }}>
        <span>FREQ SWEEP: FAST FOURIER</span>
        <span>MODULATION: VOX-RELAY ALPHA</span>
        <span>GAIN: +12dB</span>
      </div>
    </div>
  );
}
