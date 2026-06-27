import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { ProfileData } from '../features/profile/CommanderProfile';

export default function CampaignQuests({ profile, isOwner }: { profile: ProfileData, isOwner: boolean }) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    if (!profile.id) return;
    
    // Fetch units for points
    supabase.from('army_units').select('points').eq('profile_id', profile.id).then(({ data }) => {
      if (data) {
        setTotalPoints(data.reduce((sum: number, u: any) => sum + (u.points || 0), 0));
      }
    });

    // Fetch matchups for games
    supabase.from('matchups')
      .select('status, p1_id, p2_id, p1_temperament, p2_temperament')
      .or(`p1_id.eq.${profile.id},p2_id.eq.${profile.id}`)
      .then(({ data }) => {
        if (data) {
          const completed = data.filter((m: any) => {
            if (m.status !== 'completed') return false;
            const isP1 = m.p1_id === profile.id;
            return isP1 ? m.p2_temperament !== null : m.p1_temperament !== null; 
          });
          setGamesPlayed(completed.length);
        }
      });
  }, [profile.id]);

  const phases = [
    { name: 'Enlistment', targetPts: 0, requiredGames: 0 },
    { name: 'Phase I: Vanguard', targetPts: 400, requiredGames: 1 },
    { name: 'Phase II: Escalation', targetPts: 800, requiredGames: 2 },
    { name: 'Phase III: Attrition', targetPts: 1200, requiredGames: 3 },
    { name: 'Phase IV: Annihilation', targetPts: 1600, requiredGames: 4 },
    { name: 'Final Engagement', targetPts: 2000, requiredGames: 5 },
  ];

  // Current Phase determination
  let currentPhaseIndex = 0;
  for (let i = 1; i < phases.length; i++) {
    const phase = phases[i];
    if (totalPoints >= phase.targetPts && gamesPlayed >= phase.requiredGames) {
      currentPhaseIndex = i;
    } else {
      break;
    }
  }

  // Next phase tasks
  const nextPhase = phases[currentPhaseIndex + 1];
  const isEnlistmentPhase = currentPhaseIndex === 0 && (!profile.army_faction || !profile.location || !profile.army_lore);
  
  const hasFaction = !!profile.army_faction;
  const hasLocation = !!profile.location;
  const hasLore = !!profile.army_lore;

  const getPointsProgress = () => {
    if (!nextPhase) return 100;
    return Math.min(100, Math.floor((totalPoints / nextPhase.targetPts) * 100));
  };

  const getGamesProgress = () => {
    if (!nextPhase) return 100;
    return Math.min(100, Math.floor((gamesPlayed / nextPhase.requiredGames) * 100));
  };

  const isPhaseCompleted = (idx: number) => {
    if (idx === 0) return !isEnlistmentPhase || currentPhaseIndex > 0;
    return idx <= currentPhaseIndex && (idx < phases.length - 1 || !nextPhase);
  };

  if (!isOwner && currentPhaseIndex === phases.length - 1) return null; // hide for others if done

  return (
    <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--theme-accent)' }}>
      {/* Campaign Phase Progression Chronicle */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--theme-border)' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--theme-fg-muted)', marginBottom: '0.75rem' }}>
          Campaign Directives Chronicle (Quests Completed)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
          {phases.map((p, idx) => {
            const done = isPhaseCompleted(idx);
            const isActive = !done && (idx === 0 || isPhaseCompleted(idx - 1));
            return (
              <div key={p.name} style={{
                padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                backgroundColor: done ? 'rgba(34, 197, 94, 0.1)' : isActive ? 'rgba(234, 179, 8, 0.1)' : 'rgba(0, 0, 0, 0.15)',
                border: `1px solid ${done ? '#22c55e' : isActive ? '#eab308' : 'var(--theme-border)'}`,
                opacity: done || isActive ? 1 : 0.5
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', fontWeight: 'bold', color: done ? '#22c55e' : isActive ? '#eab308' : 'var(--theme-fg-muted)' }}>
                  <span>{done ? '✓ SEALED' : isActive ? '▸ ACTIVE' : '🔒 LOCKED'}</span>
                  <span>{p.targetPts > 0 ? `${p.targetPts} PTS` : 'ENLIST'}</span>
                </div>
                <div style={{ color: 'var(--theme-fg)', fontWeight: isActive ? 'bold' : 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>Active Directives: {nextPhase ? nextPhase.name : 'Campaign Concluded'}</span>
        {nextPhase && <span style={{ fontSize: '0.8rem', color: 'var(--theme-fg-muted)' }}>Current Phase: {phases[currentPhaseIndex].name}</span>}
      </h3>

      {isEnlistmentPhase ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--theme-fg-muted)', marginBottom: '0.5rem' }}>Complete your Commander Registration to enter Phase I.</div>
          <QuestItem label="Select your Army Faction" completed={hasFaction} />
          <QuestItem label="Set your Deployment Location" completed={hasLocation} />
          <QuestItem label="Scribe your Army Chronicles (Lore)" completed={hasLore} />
        </div>
      ) : nextPhase ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <QuestItem label={`Muster ${nextPhase.targetPts} pts of units`} completed={totalPoints >= nextPhase.targetPts} subtext={`Current: ${totalPoints} / ${nextPhase.targetPts} pts`} />
            <ProgressBar progress={getPointsProgress()} />
          </div>
          <div>
            <QuestItem label={`Seal ${nextPhase.requiredGames} Battle Reports`} completed={gamesPlayed >= nextPhase.requiredGames} subtext={`Current: ${gamesPlayed} / ${nextPhase.requiredGames} games`} />
            <ProgressBar progress={getGamesProgress()} />
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--theme-accent)', fontWeight: 'bold' }}>All directives complete. Await final campaign scoring!</div>
      )}
    </div>
  );
}

function QuestItem({ label, completed, subtext }: { label: string, completed: boolean, subtext?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ 
        width: '20px', height: '20px', borderRadius: '4px', 
        border: `2px solid ${completed ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
        backgroundColor: completed ? 'var(--theme-accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--theme-bg)', fontSize: '0.8rem', fontWeight: 'bold'
      }}>
        {completed ? '✓' : ''}
      </div>
      <div>
        <div style={{ textDecoration: completed ? 'line-through' : 'none', color: completed ? 'var(--theme-fg-muted)' : 'var(--theme-fg)' }}>{label}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)' }}>{subtext}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ height: '6px', backgroundColor: 'var(--theme-bg-secondary)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--theme-accent)', transition: 'width 0.5s ease' }} />
    </div>
  );
}
