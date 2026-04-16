export default function Briefing() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Strategic Briefing (Field Manual)</h2>
        <p style={{ color: 'var(--theme-fg-muted)' }}>Operational guidelines and toolset orientation for all active Commanders.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Overview & Objective
        </h3>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          The <strong>Slow Grow Trainer</strong> is an interactive narrative campaign platform for Warhammer 40,000. 
          Its purpose is to organise your slow-grow league from start to finish — tracking hobby progress on your army, scheduling fair pairings at your local game store, logging battle outcomes, and recording the honour and conduct of every Commander through the campaign.
        </p>
        <p style={{ lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--theme-accent)' }}>Honour comes first.</strong> Command Temperament and Rules of Engagement ratings matter more than kill counts or Victory Points. 
          Be a sporting opponent and know your rules — that is how you earn renown in this campaign.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Getting Started
        </h3>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
          <li><strong>Register</strong> using the sign-up form. You will need a Commander Name, Discord handle, real name, army, and preferred local game store.</li>
          <li><strong>Complete your profile</strong> — navigate to Commander Profile, finish your specs (subfaction, location), and write your Army Chronicles lore.</li>
          <li><strong>Build your Roster</strong> — head to the Army Roster tab in your profile and start adding units from the 40k 10th Edition datasheet library. Mark each unit as Built, Painted, and Played as you make progress.</li>
          <li><strong>Await pairings</strong> — the Admin will schedule your first matchup using the algorithmic matchmaker. You will see it appear in Matchups & Lore.</li>
          <li><strong>Play your game</strong> — use the Live VP Tracker in-app during the game to record scores. When done, submit your final report including your opponent's Honour ratings.</li>
        </ol>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Navigation Modules
        </h3>

        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {[
            {
              icon: '■',
              title: 'War Effort Map (Dashboard)',
              desc: 'The central strategic overview mapping real-time faction dominance across the sector. Factions accumulate Victory Points through hobby updates and battle victories, shifting control of the map dynamically.',
            },
            {
              icon: '■',
              title: 'Logistics & Clearance',
              desc: 'Submit hobby milestone updates (assembling, painting, basing) with photographic evidence. Each submission contributes to your faction\'s war score and keeps the campaign moving forward.',
            },
            {
              icon: '■',
              title: 'Matchups & Lore (Campaign Warzones)',
              desc: 'View the Global Warzone Board showing all ongoing and completed battles across the campaign. Select one of your Assigned Frontlines to update live VP scores or submit a final battle report with Honour ratings.',
            },
            {
              icon: '■',
              title: 'Army Roster (Commander Profile)',
              desc: 'Track your personal army collection unit by unit. Add units from the full 10th Edition datasheet library and mark each as Built ⚙, Painted 🎨, and Played ⚔. Your roster is public — other Commanders can see your progress. Access other players\' rosters by visiting their profile.',
            },
            {
              icon: '■',
              title: 'Commander Profile',
              desc: 'Manage your identity — update your Army Subfaction, preferred Local Game Store, and location. Upload a portrait. Scribe your force\'s narrative lore into the regional archives via the Army Chronicles tab.',
            },
            {
              icon: '■',
              title: 'Officer Assessment',
              desc: 'Nominate fellow Commanders for end-of-campaign awards — Best Painted, Best Conversion, Best Lore, and Best Sportsmanship (Command Temperament). Each Commander gets one vote per category.',
            },
          ].map(item => (
            <li key={item.title} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--theme-accent)' }}>{item.icon}</span> {item.title}
              </h4>
              <p style={{ margin: 0, color: 'var(--theme-fg-muted)', paddingLeft: '1.5rem', lineHeight: '1.5' }}>
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Honour Ratings Explained
        </h3>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          At the conclusion of every game, both Commanders submit a final battle report that includes ratings for their opponent on two critical axes:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--theme-accent)', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)' }}>⚔ Command Temperament</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>
              How sportsmanlike was your opponent? Did they play in a positive, respectful spirit? Were they a fun game to have regardless of the result?
            </p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--theme-accent)', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)' }}>⚔ Rules of Engagement</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>
              How well did your opponent understand and apply the game rules? Did the game flow smoothly thanks to their rules knowledge?
            </p>
          </div>
        </div>
        <p style={{ lineHeight: '1.6', marginTop: '1rem', color: 'var(--theme-fg-muted)', fontSize: '0.85rem' }}>
          Ratings are on a 1–5 star scale. They are permanent, visible to all Commanders on the Global Warzone Board, and represent the true measure of a warrior in this campaign.
        </p>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Thematic Override
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          Located at the top-right of your operational view is the <strong>Theme Override</strong> selector. Switch it to match your chosen army faction — Chaos, Tyranids, Orks, Necrons, and more — to adapt the visual styling of the entire interface.
        </p>
      </div>
    </div>
  );
}
