import { useState, useEffect, useRef } from 'react';
import VoxWaveform from './VoxWaveform';
import VoxAudioPlayer from './VoxAudioPlayer';

const CAMPAIGN_START = new Date('2026-07-01T00:00:00');

export default function CampaignTimeline() {
  const [devOverride, setDevOverride] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(false));
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  function getTimeLeft(override = devOverride) {
    if (override) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
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
    setTimeLeft(getTimeLeft(devOverride));
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(devOverride));
    }, 1000);
    return () => clearInterval(timer);
  }, [devOverride]);

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
      <h3 style={{ color: 'var(--theme-accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Campaign Timeline
      </h3>

      {import.meta.env.DEV && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setDevOverride(!devOverride)}
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.8rem',
              backgroundColor: devOverride ? 'var(--theme-accent)' : 'transparent',
              color: devOverride ? '#000' : 'var(--theme-accent)',
              border: '1px solid var(--theme-accent)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            {devOverride ? '[⚡ SIMULATION ACTIVE: VOX FEED LIVE (CLICK TO RESET)]' : '[🛠️ DEV: SIMULATE JULY 1ST VOX TRANSMISSION]'}
          </button>
        </div>
      )}

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
        <div className="card" style={{ marginBottom: '2rem', padding: '0', overflow: 'hidden', border: '1px solid #1a2e1a', textAlign: 'left' }}>
          <div style={{ backgroundColor: '#0a140a', padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a2e1a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#4ade80', fontSize: '1.2rem', fontFamily: 'monospace' }}>_</span>
            <h2 style={{ fontSize: '1rem', margin: 0, color: '#4ade80', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>
              INCOMING VOX TRANSMISSION :: SECTOR COMMAND
            </h2>
          </div>
          <div className="terminal-communique imperial" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '1.5rem', textAlign: 'left' }}>
            <VoxWaveform isPlaying={isPlaying} audioRef={audioRef} />

            <VoxAudioPlayer
              audioRef={audioRef}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              src="/Inquisitor-lore-slow-grow-voxcast-final.m4a"
            />

            <div style={{ fontSize: '0.85rem', color: '#22c55e', borderBottom: '1px dashed #1a2e1a', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>+++ INCOMING VOX TRANSMISSION +++</div>
              <div>SOURCE ID: Planetary Governer Silvanus Petro</div>
              <div>DESTINATION: Imperial Forces of Vesperia Prime</div>
              <div>ENCRYPTION LEVEL: Secure Alpha</div>
              <div>DATE/STAMP: 01.07.M41 / 0200 HRS</div>
            </div>

            <div style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '0.5rem' }}>--- MESSAGE BEGINS ---</div>

            <p style={{ margin: '0 0 1rem 0' }}>
              My loyal forces! We have had attacks across all parts of the planet now. You have seen what they're doing.
            </p>

            <p style={{ margin: '0 0 1rem 0' }}>
              The enemies are everywhere. They're not just the heretic rabble. The nobles must be in on it too. Yes, they're all conspiring against me. They want to have this planet for themselves. I won't have it! We will crush my enemies have this world cleansed. I would destroy the factories before letting anyone else have them.
            </p>

            <p style={{ margin: '0 0 1rem 0' }}>
              All forces are hereby ordered to retreat back to the inner walls closest to the palace. My retinue and I are too valuable to lose. I have requisitioned a lander to bring us off world. From there, my forces and I will - yes, what is Lanksheim? For throne's sake, I'm in the middle of a broadcast! What do you mean? No, I never invited anyone named - Who the hell are you? Get out of my chamber at once!
            </p>

            <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>
              Inquisitor Charmeleus Kane: Governor Silvanus Petro, you have been found wanting in your duties to this world by the Inquisition. You are hereby relieved of your command and your life.
            </p>

            <p style={{ margin: '0 0 1rem 0', fontStyle: 'italic', color: '#ef4444' }}>
              (Gunshot)
            </p>

            <p style={{ margin: '0 0 1rem 0' }}>
              Forces of the Imperium, my name is Inquisitor Charmeleus Kane. I am now in command of the forces of this world. Unfortunately, your governor was weak and stupid. I am not. You are to remain at your posts. My spies have informed me of the situation on this world and it is much worse than even your governor’s paranoia. Several of the so-called noble houses of this planet have aligned themselves with Xenos in exchange for simple wealth, while some others have corrupted themselves with other forms of heresy. It is no matter. My team will root out the heretics and traitors from this world. It is up to you and the forces I have requested to defend this planet while I do so. The mineral and promethium deposits here are crucial for the battles in the neighboring systems. We need to make sure those supplies continue flowing out of this planet. Your lives depend on it.
            </p>

            <p style={{ margin: '0 0 1rem 0' }}>
              Prove to me you are not as weak as your simpleton governor. Do your duty and you shall not be found wanting.
            </p>

            <p style={{ margin: '0 0 1rem 0' }}>
              The Emperor Protects.
            </p>

            <div style={{ color: '#22c55e', fontSize: '0.9rem', marginTop: '1rem', borderTop: '1px dashed #1a2e1a', paddingTop: '1rem' }}>
              <div>--- MESSAGE ENDS ---</div>
              <div>+++ AUTHENTICATION: 9324282301 +++</div>
              <div>+++ END OF TRANSMISSION +++</div>
            </div>
          </div>
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
