import React from 'react';

interface TranslatedHeaderProps {
  text: string;
  theme: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

function toBinary(str: string) {
  return str.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join(' ');
}

export default function TranslatedHeader({ text, theme, className, style, as = 'h1' }: TranslatedHeaderProps) {
  const Component = as;

  // For Adeptus Mechanicus, render binary in a terminal wrapper
  if (theme === 'adeptus_mechanicus') {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          backgroundColor: '#000',
          border: '1px solid #33ff33',
          padding: '0.5rem',
          fontFamily: 'monospace',
          color: '#33ff33',
          fontSize: '0.75rem',
          marginBottom: '0.25rem',
          boxShadow: '0 0 10px rgba(51, 255, 51, 0.2)',
          textShadow: '0 0 5px #33ff33'
        }}>
          &gt; {toBinary(text)}
          <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
        </div>
        <Component className={className} style={{ ...style, fontSize: '0.8rem', color: 'var(--theme-fg-muted)', letterSpacing: '1px', marginBottom: 0, fontFamily: 'Outfit, sans-serif' }}>
          [ {text.toUpperCase()} ]
        </Component>
      </div>
    );
  }

  // For Necrons
  if (theme === 'necrons') {
    return (
      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Component className={className} style={{ ...style, fontFamily: 'NecronCrypt, Orbitron, sans-serif', letterSpacing: '2px', marginBottom: '0.1rem', textTransform: 'lowercase' }}>
          {text.toLowerCase()}
        </Component>
        <div style={{ fontSize: '0.75rem', fontFamily: 'Outfit, sans-serif', color: 'var(--theme-fg-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {text}
        </div>
      </div>
    );
  }

  // For Tau
  if (theme === 'tau_empire') {
    return (
      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Component className={className} style={{ ...style, fontFamily: 'Tau40k, Teko, sans-serif', letterSpacing: '2px', marginBottom: '0.1rem', textTransform: 'lowercase' }}>
          {text.toLowerCase()}
        </Component>
        <div style={{ fontSize: '0.75rem', fontFamily: 'OCRAStd, monospace', color: 'var(--theme-fg-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {text}
        </div>
      </div>
    );
  }

  // Default rendering (for Imperium, Chaos, etc.) where fonts are handled entirely by CSS variables
  return (
    <Component className={className} style={{ ...style, marginBottom: '1rem' }}>
      {text}
    </Component>
  );
}
