import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { DESCRIPTION_MAX, TITLE_MAX, validateNomination, type LegendaryMoment } from './legendaryMoments';

interface Props {
  matchupId: string;
  userId: string;
  /** NULL on a bye: there is no opponent to honour. */
  opponentId: string | null;
  opponentName?: string;
}

const STATUS_TEXT: Record<LegendaryMoment['status'], string> = {
  pending: 'Awaiting review by Campaign Command.',
  approved: 'Approved — it now appears on the honoured commander’s profile and the War Effort page.',
  rejected: 'Not approved this time.',
};

/** One nomination per player per completed battle, for either player's moment. */
export default function NominateMoment({ matchupId, userId, opponentId, opponentName }: Props) {
  const [existing, setExisting] = useState<LegendaryMoment | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [honouredId, setHonouredId] = useState(userId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('legendary_moments')
        .select('id, matchup_id, nominated_by, honoured_id, title, description, status, created_at')
        .eq('matchup_id', matchupId)
        .eq('nominated_by', userId)
        .maybeSingle();
      // On a read error, stay hidden rather than offer a form that may duplicate a nomination.
      setExisting(error ? undefined : ((data as LegendaryMoment | null) ?? null));
    } catch {
      setExisting(undefined);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    setOpen(false);
    setMessage('');
  }, [matchupId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validateNomination(title, description);
    if (problem) { setMessage(problem); return; }

    const { error } = await supabase.from('legendary_moments').insert({
      matchup_id: matchupId,
      nominated_by: userId,
      honoured_id: honouredId,
      title: title.trim(),
      description: description.trim(),
    });
    if (error) {
      setMessage('Could not submit the nomination: ' + error.message);
      return;
    }
    setTitle('');
    setDescription('');
    setOpen(false);
    setMessage('');
    load();
  };

  const withdraw = async () => {
    if (!existing) return;
    const { error } = await supabase.from('legendary_moments').delete().eq('id', existing.id);
    if (error) setMessage('Could not withdraw the nomination: ' + error.message);
    else load();
  };

  if (existing === undefined) return null;

  const box: React.CSSProperties = {
    border: '1px solid #eab308', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem',
    background: 'linear-gradient(to right, rgba(234, 179, 8, 0.08), transparent)',
  };
  const heading = <div style={{ color: '#eab308', fontWeight: 'bold', marginBottom: '0.35rem' }}>★ Legendary Moment</div>;

  if (existing) {
    return (
      <div style={box}>
        {heading}
        <div style={{ fontWeight: 'bold' }}>{existing.title}</div>
        <p style={{ margin: '0.35rem 0', fontStyle: 'italic', color: 'var(--theme-fg-muted)', whiteSpace: 'pre-wrap' }}>{existing.description}</p>
        <div style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>{STATUS_TEXT[existing.status]}</div>
        {existing.status === 'pending' && (
          <button type="button" onClick={withdraw}
            style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
            Withdraw nomination
          </button>
        )}
        {message && <div style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.5rem' }}>{message}</div>}
      </div>
    );
  }

  if (!open) {
    return (
      <div style={box}>
        {heading}
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--theme-fg-muted)' }}>
          Did something unforgettable happen at the table — yours or your opponent’s? Nominate it.
          Legendary Moments are honours only: they change no rules, points or territory.
        </p>
        <button type="button" className="btn" onClick={() => setOpen(true)} style={{ fontSize: '0.85rem' }}>
          Nominate a Legendary Moment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ ...box, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {heading}
      {opponentId && (
        <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <legend style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>Whose moment was it?</legend>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" name="honoured" checked={honouredId === userId} onChange={() => setHonouredId(userId)} /> Mine
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input type="radio" name="honoured" checked={honouredId === opponentId} onChange={() => setHonouredId(opponentId)} /> {opponentName || 'My opponent'}’s
          </label>
        </fieldset>
      )}
      <div>
        <label htmlFor="momentTitle" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>Title</label>
        <input id="momentTitle" type="text" value={title} maxLength={TITLE_MAX}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. The Armiger’s Last Stand"
          style={{ width: '100%', padding: '0.6rem', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label htmlFor="momentDescription" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' }}>What happened?</label>
        <textarea id="momentDescription" value={description} maxLength={DESCRIPTION_MAX}
          onChange={e => setDescription(e.target.value)}
          placeholder="A sentence or two about the moment."
          style={{ width: '100%', height: '80px', padding: '0.6rem', boxSizing: 'border-box',
            backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border)' }} />
        <div style={{ fontSize: '0.7rem', color: 'var(--theme-fg-muted)', textAlign: 'right' }}>{description.length}/{DESCRIPTION_MAX}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn primary" style={{ fontSize: '0.85rem' }}>Submit nomination</button>
        <button type="button" className="btn" onClick={() => { setOpen(false); setMessage(''); }} style={{ fontSize: '0.85rem' }}>Cancel</button>
      </div>
      {message && <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{message}</div>}
    </form>
  );
}
