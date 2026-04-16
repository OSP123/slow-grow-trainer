

export default function Briefing() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Strategic Briefing (Field Manual)</h2>
        <p style={{ color: 'var(--theme-fg-muted)' }}>Operational guidelines and toolset orientation for active Commanders.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Overview & Objective
        </h3>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          The <strong>Slow Grow Trainer</strong> is an interactive simulation and logistics platform tailored for narrative Warhammer campaigns. 
          Its primary directive is to centralize your army's progression, manage battlefield pairings, and track player milestones over an extended, synchronized campaign.
        </p>
        <p style={{ lineHeight: '1.6' }}>
          Whether you are rapidly assembling forces for the first time or tracking crusade experience across multiple theaters of war, this tool ensures your operational data is secured, calculated, and broadcasted to the entire operational region.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Key Navigation Nodes
        </h3>
        
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--theme-accent)' }}>■</span> War Effort Map (Dashboard)
            </h4>
            <p style={{ margin: 0, color: 'var(--theme-fg-muted)', paddingLeft: '1.5rem', lineHeight: '1.5' }}>
              The central command interface mapping real-time global dominance. Factions accumulate Victory Points through logistics updates and battle victories to color the map dynamically over time.
            </p>
          </li>

          <li style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--theme-accent)' }}>■</span> Logistics & Clearance
            </h4>
            <p style={{ margin: 0, color: 'var(--theme-fg-muted)', paddingLeft: '1.5rem', lineHeight: '1.5' }}>
              Upload your Hobby Milestones (assembling, painting, basing) alongside photographic evidence. Generating logistic entries acts as a multiplier to your faction's overall war score.
            </p>
          </li>

          <li style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--theme-accent)' }}>■</span> Matchups & Lore (Battles)
            </h4>
            <p style={{ margin: 0, color: 'var(--theme-fg-muted)', paddingLeft: '1.5rem', lineHeight: '1.5' }}>
              Displays algorithmically generated pairings based on your preferred Sanctioned Venue and experience level. Report your battlefield outcomes directly back to the mainframe.
            </p>
          </li>

          <li style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--theme-accent)' }}>■</span> Commander Profile
            </h4>
            <p style={{ margin: 0, color: 'var(--theme-fg-muted)', paddingLeft: '1.5rem', lineHeight: '1.5' }}>
              Manage your identity. Update your Army Subfaction, specify your operational base (Local Game Store), upload avatars, and scribe your Army's narrative lore into the regional archives.
            </p>
          </li>
        </ul>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Thematic Overrides
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          Located at the top-right of your main operational view is the <strong>Theme Override</strong> selector. 
          Use this setting to permanently adapt the styling matrix of the software to match your chosen army faction (e.g., Chaos, Tyranids, Orks).
        </p>
      </div>
    </div>
  );
}
