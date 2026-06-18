import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { MessageSquare, Heart, Star, Shield, Skull, Flame, X, Send, Trash2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  unit_name: string;
  image_url: string;
  created_at: string;
  profiles: any;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles?: any;
}

interface Emote {
  id: string;
  emote: string;
  user_id: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    fetchGallery();
  }, []);

  async function fetchGallery() {
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

  async function loadSocialData(unitId: string) {
    // Comments
    const { data: cData } = await supabase
      .from('gallery_comments')
      .select('id, comment, created_at, user_id, profiles!inner(commander_name)')
      .eq('unit_id', unitId)
      .order('created_at', { ascending: true });
    
    if (cData) setComments(cData);

    // Emotes
    const { data: eData } = await supabase
      .from('gallery_emotes')
      .select('id, emote, user_id')
      .eq('unit_id', unitId);
    
    if (eData) setEmotes(eData);
  }

  const handleImageClick = (img: GalleryImage) => {
    setSelectedImage(img);
    setComments([]);
    setEmotes([]);
    loadSocialData(img.id).catch(e => {
      console.error('Error loading social data. Tables might not exist yet.', e);
    });
  };

  const closeDialog = () => {
    setSelectedImage(null);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedImage || !currentUser) return;
    
    if (newComment.trim().length > 1000) {
      setCommentError('Comment cannot exceed 1000 characters.');
      return;
    }
    setCommentError('');
    
    const { error } = await supabase.from('gallery_comments').insert({
      unit_id: selectedImage.id,
      user_id: currentUser.id,
      comment: newComment.trim()
    });

    if (!error) {
      setNewComment('');
      loadSocialData(selectedImage.id);
    } else {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    await supabase.from('gallery_comments').delete().eq('id', commentId).eq('user_id', currentUser.id);
    setComments(comments.filter(c => c.id !== commentId));
  };

  const handleToggleEmote = async (emoteType: string) => {
    if (!selectedImage || !currentUser) return;

    const existing = emotes.find(e => e.emote === emoteType && e.user_id === currentUser.id);
    if (existing) {
      await supabase.from('gallery_emotes').delete().eq('id', existing.id);
    } else {
      await supabase.from('gallery_emotes').insert({
        unit_id: selectedImage.id,
        user_id: currentUser.id,
        emote: emoteType
      });
    }
    loadSocialData(selectedImage.id);
  };



  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--theme-fg-muted)' }}>Interrogating Machine Spirit...</div>;

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
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => handleImageClick(img)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.4), 0 0 0 1px var(--theme-accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
            }}
            >
              <div style={{ width: '100%', paddingBottom: '100%', position: 'relative' }}>
                <img 
                  src={img.image_url} 
                  alt={img.unit_name}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover'
                  }} 
                />
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px' }}>{img.unit_name}</strong>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--theme-accent)' }}>
                    {(Array.isArray(img.profiles) ? img.profiles[0]?.commander_name : img.profiles?.commander_name) || 'Unknown Commander'}
                  </span>
                </div>
                <div style={{ color: 'var(--theme-fg-muted)', display: 'flex', gap: '0.5rem' }}>
                  <MessageSquare size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem'
        }} onClick={closeDialog}>
          <div style={{
            backgroundColor: 'var(--theme-bg)',
            border: '1px solid var(--theme-accent)',
            borderRadius: '8px',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Left: Image */}
            <div style={{ flex: '1.5', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img src={selectedImage.image_url} alt={selectedImage.unit_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              <button 
                onClick={closeDialog}
                style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Right: Comments & Details */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--theme-bg)', borderLeft: '1px solid var(--theme-border)', minWidth: '300px' }}>
              {/* Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-border)' }}>
                <h3 style={{ margin: '0 0 0.25rem 0' }}>{selectedImage.unit_name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--theme-accent)' }}>
                  Painted by {(Array.isArray(selectedImage.profiles) ? selectedImage.profiles[0]?.commander_name : selectedImage.profiles?.commander_name) || 'Unknown Commander'}
                </div>
              </div>

              {/* Emotes Bar */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--theme-border)', display: 'flex', gap: '1rem' }}>
                {[
                  { type: 'fire', icon: Flame, color: '#ef4444' },
                  { type: 'heart', icon: Heart, color: '#ec4899' },
                  { type: 'skull', icon: Skull, color: '#a8a29e' },
                  { type: 'shield', icon: Shield, color: '#3b82f6' },
                  { type: 'star', icon: Star, color: '#eab308' },
                ].map(({ type, icon: Icon, color }) => {
                  const count = emotes.filter(e => e.emote === type).length;
                  const hasEmoted = currentUser && emotes.some(e => e.emote === type && e.user_id === currentUser.id);
                  return (
                    <button
                      key={type}
                      onClick={() => handleToggleEmote(type)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        color: hasEmoted ? color : 'var(--theme-fg-muted)',
                        padding: '0.25rem'
                      }}
                      title={type}
                    >
                      <Icon size={20} fill={hasEmoted ? color : 'none'} />
                      {count > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Comments List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--theme-fg-muted)', fontStyle: 'italic', marginTop: '2rem' }}>
                    No comments yet. Be the first!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--theme-accent)' }}>
                          {(Array.isArray(c.profiles) ? c.profiles[0]?.commander_name : c.profiles?.commander_name) || 'Unknown'}
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)' }}>
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          {currentUser && c.user_id === currentUser.id && (
                            <button 
                              onClick={() => handleDeleteComment(c.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{c.comment}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              {currentUser ? (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--theme-border)' }}>
                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={e => { setNewComment(e.target.value); setCommentError(''); }}
                      placeholder="Add a comment..."
                      maxLength={1000}
                      style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)' }}
                    />
                    <button type="submit" disabled={!newComment.trim()} style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg)', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={18} />
                    </button>
                  </form>
                  {commentError && (
                    <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>{commentError}</div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '1rem', borderTop: '1px solid var(--theme-border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--theme-fg-muted)' }}>
                  Log in to leave a comment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
