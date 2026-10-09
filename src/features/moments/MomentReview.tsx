import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { formatCommanderWithDiscord } from '../../utils/commanderUtils';
import { baseTheatre } from '../../data/theatres';
import { MOMENT_SELECT, type LegendaryMoment, type MomentStatus } from './legendaryMoments';

/** Admin queue: approve or reject nominated Legendary Moments. */
export default function MomentReview() {
  const [moments, setMoments] = useState<LegendaryMoment[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [showReviewed, setShowReviewed] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setAdminId(user.id);
    try {
      const { data } = await supabase
        .from('legendary_moments')
        .select(MOMENT_SELECT)
        .order('created_at', { ascending: false });
      if (data) setMoments(data as unknown as LegendaryMoment[]);
    } catch {
      setMessage('Could not load nominations.');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, []);

  const review = async (m: LegendaryMoment, status: MomentStatus) => {
    setMessage('');
    const { error } = await supabase
      .from('legendary_moments')
      .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
      .eq('id', m.id);
    if (error) setMessage('Error updating moment: ' + error.message);
    else {
      setMessage(`"${m.title}" ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'returned to the queue'}.`);
      fetchAll();
    }
  };

  const pending = moments.filter(m => m.status === 'pending');
  const visible = showReviewed ? moments : pending;

  return (
    <div id="moment-review-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--theme-border)' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Legendary Moment Nominations</h3>
      <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Players nominate standout moments from their battles. Approved moments appear on the honoured
        commander’s profile and the War Effort page. They are honours only — no rules, points or map effect.
      </p>

      {message && (
        <div style={{ padding: '0.75rem', marginBottom: '1rem', border: '1px solid var(--theme-accent)', color: 'var(--theme-accent)', fontSize: '0.85rem' }}>
          {message}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={showReviewed} onChange={e => setShowReviewed(e.target.checked)} />
        Include already reviewed ({pending.length} pending of {moments.length})
      </label>

      {visible.length === 0 ? (
        <p style={{ color: 'var(--theme-fg-muted)', fontSize: '0.85rem' }}>No nominations waiting for review.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visible.map(m => (
            <li key={m.id} style={{ border: '1px solid var(--theme-border)', borderRadius: '6px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>★ {m.title}</strong>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: m.status === 'approved' ? '#4ade80' : m.status === 'rejected' ? '#f87171' : '#f59e0b' }}>
                  {m.status}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0', fontStyle: 'italic', color: 'var(--theme-fg-muted)', whiteSpace: 'pre-wrap' }}>{m.description}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)', marginBottom: '0.75rem' }}>
                Honours <strong>{formatCommanderWithDiscord(m.honoured, 'Unknown')}</strong>
                {' '}· nominated by {formatCommanderWithDiscord(m.nominator, 'Unknown')}
                {m.matchup?.campaign_month ? ` · Round ${m.matchup.campaign_month}` : ''}
                {baseTheatre(m.matchup?.theatre_name) ? ` · ${baseTheatre(m.matchup?.theatre_name)}` : ''}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {m.status !== 'approved' && (
                  <button className="btn primary" onClick={() => review(m, 'approved')} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Approve</button>
                )}
                {m.status !== 'rejected' && (
                  <button className="btn" onClick={() => review(m, 'rejected')} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>Reject</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
