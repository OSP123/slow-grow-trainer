import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function Gallery() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      // Fetch army_units where image_url is not null
      const { data, error } = await supabase
        .from('army_units')
        .select('id, unit_name, image_url, created_at, profiles!inner(commander_name)')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        setImages(data);
      }
      setLoading(false);
    }
    fetchGallery();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>Scanning Pict-Captures...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem', color: 'var(--theme-accent)' }}>Sector Pict-Captures</h1>
      <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '2rem' }}>
        Visual records of forces deployed across Vespera Prime, submitted by the commanders of this sector.
      </p>

      {images.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--theme-fg-muted)' }}>
          No pict-captures have been logged to the archive yet. Add photos to your Army Roster to see them here!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {images.map(img => (
            <div key={img.id} style={{
              backgroundColor: 'var(--theme-bg-secondary)',
              border: '1px solid var(--theme-border)',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ width: '100%', paddingBottom: '100%', position: 'relative' }}>
                <a href={img.image_url} target="_blank" rel="noreferrer">
                  <img 
                    src={img.image_url} 
                    alt={img.unit_name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }} 
                  />
                </a>
              </div>
              <div style={{ padding: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px' }}>{img.unit_name}</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--theme-accent)' }}>
                  Painted by {img.profiles?.commander_name || 'Unknown Commander'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
