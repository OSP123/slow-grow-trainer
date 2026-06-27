import { useState, useEffect } from 'react';

const CAMPAIGN_START = new Date('2026-07-01T00:00:00');

export default function CampaignTimeline() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const total = CAMPAIGN_START.getTime() - new Date().getTime();
    if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
      started: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timelineSteps = [
    { label: 'Enlistment Open', sub: 'Before July 1', pts: '0', current: !timeLeft.started },
    { label: 'Phase I: Vanguard', sub: 'July', pts: '400', current: false },
    { label: 'Phase II: Escalation', sub: 'August', pts: '800', current: false },
    { label: 'Phase III: Attrition', sub: 'September', pts: '1200', current: false },
    { label: 'Phase IV: Annihilation', sub: 'October', pts: '1600', current: false },
    { label: 'Final Engagement', sub: 'November', pts: '2000', current: false },
  ];

  return (
    <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
      <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Campaign Timeline
      </h3>

      {!timeLeft.started ? (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--theme-fg-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
            Time Until Deployment
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Min', value: timeLeft.minutes },
              { label: 'Sec', value: timeLeft.seconds }
            ].map(t => (
              <div key={t.label} style={{ 
                border: '1px solid var(--theme-accent)', 
                backgroundColor: 'var(--theme-bg-secondary)',
                padding: '1rem',
                minWidth: '70px',
                borderRadius: '4px'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--theme-accent)', lineHeight: 1 }}>{t.value}</div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--theme-fg-muted)', marginTop: '0.5rem', letterSpacing: '1px' }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--theme-accent)', backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
          The War for Vespera Prime Begins
        </div>
      )}

      {/* Visual Timeline */}
      <div className="timeline-container">
        {/* Connecting Line */}
        <div className="timeline-line" />

        {timelineSteps.map((step, i) => (
          <div key={i} className="timeline-step" style={{ opacity: step.current ? 1 : 0.6 }}>
            <div className="timeline-step-circle" style={{ 
              backgroundColor: step.current ? 'var(--theme-accent)' : 'var(--theme-bg-secondary)',
              border: `2px solid ${step.current ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
              color: step.current ? 'var(--theme-bg)' : 'var(--theme-fg)'
            }}>
              {step.pts}
            </div>
            <div>
              {step.current && (
                <div style={{ fontSize: '0.65rem', backgroundColor: 'var(--theme-accent)', color: 'var(--theme-bg)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'inline-block' }}>
                  We Are Here
                </div>
              )}
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '2px', color: step.current ? 'var(--theme-fg)' : 'var(--theme-fg-muted)' }}>{step.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--theme-fg-muted)' }}>{step.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
