import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const MILESTONES = [
  '500 Points Built',
  '500 Points Painted',
  '1000 Points Built',
  '1000 Points Painted'
];

export default function Logistics() {
  const [history, setHistory] = useState<any[]>([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file || !activeUpload) return;
    setUploading(true);

    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `milestones/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hobby_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('hobby_photos').getPublicUrl(filePath);

      await supabase.from('hobby_milestones').insert({
        user_id: userId,
        mega_faction: 'imperium', // Placeholder until user profile exists
        points_threshold: parseInt(activeUpload),
        status: 'pending',
        photo_url: urlData.publicUrl
      });

      setFile(null);
      setActiveUpload(null);
      // Realistically we'd reload history here
    } catch (error) {
      console.error('Error uploading milestone proof:', error);
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
          const isCompleted = history.some(h => h.points_threshold === parseInt(milestone) && h.status === 'approved');
          const isPending = history.some(h => h.points_threshold === parseInt(milestone) && h.status === 'pending');
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
                    {uploading ? 'UPLOADING...' : 'Submit Clearance Request'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
