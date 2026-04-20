import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { compressImage } from '../../utils/imageCompression';

const MILESTONES = [
  'Warlord Built',
  'Warlord Painted',
  '500 Points Built',
  '500 Points Painted',
  '1000 Points Built',
  '1000 Points Painted',
  '1500 Points Built',
  '1500 Points Painted',
  '2000 Points Built',
  '2000 Points Painted'
];

interface HobbyMilestone {
  milestone_step: string;
  status: string;
}

export default function Logistics() {
  const [history, setHistory] = useState<HobbyMilestone[]>([]);
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      const { data } = await supabase.from('hobby_milestones').select('*');
      if (data) setHistory(data);
    }
    loadHistory();
  }, []);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file || !activeUpload) return;
    setUploading(true);
    setUploadError(null);

    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      // Compress before upload
      const { file: compressed, error: compressError } = await compressImage(file, 1920, 0.8);
      if (compressError) {
        setUploadError(compressError);
        setUploading(false);
        return;
      }

      const fileName = `${userId}-${Math.random()}.jpg`;
      const filePath = `milestones/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('hobby_photos')
        .upload(filePath, compressed);

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('hobby_photos').getPublicUrl(filePath);

      await supabase.from('hobby_milestones').insert({
        user_id: userId,
        mega_faction: 'imperium',
        milestone_step: activeUpload,
        status: 'pending',
        photo_url: urlData.publicUrl
      });

      setFile(null);
      setActiveUpload(null);
    } catch (error) {
      console.error('Error uploading milestone proof:', error);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Deployment Clearance</h2>
      <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '2rem' }}>
        Log your hobby progress to earn points for your megafaction. 
        Submission requires photographic evidence for officer review.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MILESTONES.map((milestone) => {
          const isCompleted = history.some(h => h.milestone_step === milestone && h.status === 'approved');
          const isPending = history.some(h => h.milestone_step === milestone && h.status === 'pending');
          const isSelectedForUpload = activeUpload === milestone;

          return (
            <div key={milestone} style={{ padding: '1rem', border: '1px solid var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: isCompleted || isPending ? 'not-allowed' : 'pointer' }}>
                <input 
                  type="checkbox" 
                  disabled={isCompleted || isPending}
                  checked={isCompleted || isPending || isSelectedForUpload}
                  onChange={() => !isCompleted && !isPending && setActiveUpload(isSelectedForUpload ? null : milestone)}
                />
                <span style={{ fontWeight: 'bold' }}>{milestone}</span>
                {isCompleted && <span style={{ color: 'var(--theme-accent)', marginLeft: 'auto' }}>[ CLEARED ]</span>}
                {isPending && <span style={{ color: 'var(--theme-fg-muted)', marginLeft: 'auto' }}>[ PENDING REVIEW ]</span>}
              </label>

              {isSelectedForUpload && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', borderTop: '1px dashed var(--theme-border)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-fg-muted)' }} htmlFor="proof-upload">
                    Attach Photographic Proof
                  </label>
                  <input 
                    id="proof-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ marginBottom: '1rem' }}
                  />
                  <button 
                    onClick={handleUploadSubmit} 
                    disabled={!file || uploading}
                    className="btn primary"
                  >
                    {uploading ? 'Compressing & Uploading...' : 'Submit Clearance Request'}
                  </button>
                  {uploadError && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#f87171' }}>
                      ⚠ {uploadError}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
