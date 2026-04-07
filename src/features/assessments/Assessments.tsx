import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function Assessments() {
  const [category, setCategory] = useState('best_painted');
  const [nomineeId, setNomineeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomineeId) return;

    setSubmitting(true);
    setMessage('');

    try {
      const { data } = await supabase.auth.getUser();
      const voterId = data.user?.id;
      if (!voterId) throw new Error('Not authenticated.');

      const { error } = await supabase.from('campaign_votes').insert({
        voter_id: voterId,
        nominee_id: nomineeId,
        category: category
      });

      if (error) {
        if (error.code === '23505') {
          setMessage('You have already cast a vote in this category for this commander.');
        } else {
          throw error;
        }
      } else {
        setMessage('Vote logged securely into the Simulation Protocol.');
        setNomineeId('');
      }
    } catch (err: any) {
      console.error(err);
      setMessage('Error submitting vote. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Officer Assessment</h2>
      <p style={{ color: 'var(--theme-fg-muted)', marginBottom: '2rem' }}>
        Cast your final tournament commendations here. Enter the unique identifier of the commander you wish to vote for to ensure a secure, unforgeable assessment.
      </p>

      <form onSubmit={handleVoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem' }}>Award Category</label>
          <select 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-fg)', border: '1px solid var(--theme-border)' }}
          >
            <option value="best_painted">Best Painted (Visual Excellence)</option>
            <option value="best_conversion">Best Conversion (Artisan's Merit)</option>
            <option value="best_lore">Best Lore (Archivist's Seal)</option>
            <option value="best_sportsmanship">Best Sportsmanship (Command Temperament)</option>
          </select>
        </div>

        <div>
          <label htmlFor="nominee" style={{ display: 'block', marginBottom: '0.5rem' }}>Nominee (Commander ID)</label>
          <input 
            id="nominee" 
            type="text" 
            value={nomineeId} 
            onChange={(e) => setNomineeId(e.target.value)} 
            placeholder="Enter opponent's secure UUID..."
            required
            style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" className="btn primary" disabled={submitting || !nomineeId}>
          {submitting ? 'Transmitting Data...' : 'Submit Official Vote'}
        </button>

        {message && (
          <div style={{ padding: '1rem', border: '1px solid var(--theme-border)', color: 'var(--theme-accent)' }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
