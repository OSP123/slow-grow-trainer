import { useEffect, useState } from 'react';
import './Atmosphere.css';

export default function Atmosphere() {
  const [embers, setEmbers] = useState<Array<{ id: number; left: number; duration: number; size: number; delay: number; dir: number }>>([]);

  useEffect(() => {
    // Generate static embers to animate via CSS
    const generatedEmbers = [];
    const emberCount = 15; // Kept low for mobile performance

    for (let i = 0; i < emberCount; i++) {
      generatedEmbers.push({
        id: i,
        left: Math.random() * 100, // percentage
        duration: 8 + Math.random() * 12, // seconds
        delay: Math.random() * 15, // start stagger
        size: 2 + Math.random() * 4, // pixels
        dir: Math.random() > 0.5 ? 1 : -1, // drift direction
      });
    }
    setEmbers(generatedEmbers);
  }, []);

  return (
    <div className="atmosphere-container">
      {/* Fog Layers */}
      <div className="fog-layer"></div>
      <div className="fog-layer layer-2"></div>

      {/* Embers */}
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="ember"
          style={{
            left: `${ember.left}vw`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            animationDuration: `${ember.duration}s`,
            animationDelay: `${ember.delay}s`,
            '--drift-dir': ember.dir
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
