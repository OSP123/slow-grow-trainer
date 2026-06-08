import CampaignTimeline from '../../components/CampaignTimeline';

export default function Briefing() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Strategic Briefing (Field Manual)</h2>
        <p style={{ color: 'var(--theme-fg-muted)' }}>Operational guidelines and toolset orientation for all active Commanders.</p>
      </div>

      <CampaignTimeline />

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Overview & Objective
        </h3>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          The <strong>Slow Grow Trainer</strong> is an interactive narrative campaign platform for Warhammer 40,000. 
          Its purpose is to organise your slow-grow league from start to finish — tracking hobby progress on your army, scheduling fair pairings at your local game store, logging battle outcomes, and recording the honour and conduct of every Commander through the campaign.
        </p>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--theme-accent)' }}>Honour comes first.</strong> Command Temperament and Hobby Spirit ratings matter more than kill counts or Victory Points. 
          Be a sporting opponent and know your rules — that is how you earn renown in this campaign.
        </p>
        <p style={{ lineHeight: '1.6' }}>
          To further emphasize the narrative, we are allowing commanders to forge their own heroes using the <strong>Crucible of Champions</strong> rules. If you can find these rules, you are free to create up to 3 custom leaders for your force.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Campaign Structure & Matchmaking
        </h3>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          The campaign is structured around four crucial escalation checkpoints: <strong>400, 800, 1200, and 1600 points</strong>. As your army grows, so does the scale of war. The Slow Grow campaign officially begins on <strong>July 1</strong>.
        </p>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          We utilize an <strong>automated matchmaking system</strong> to ensure fair and diverse pairings. <strong>Every Commander must play at least one official game at each of the 4 checkpoints</strong> to maintain the campaign narrative and progression.
        </p>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          To participate in the league, there is a nominal <strong>$15 entry fee</strong>. 100% of these fees go directly toward supporting the venue and funding the prize pool for the conclusion of the campaign.
        </p>
        
        <div style={{ background: 'var(--theme-bg-secondary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--theme-border)', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-accent)' }}>League Payment</h4>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Please submit your entry fee via Venmo:<br />
            <a href="https://venmo.com/code?user_id=1242039823892480948&created=1780955737" target="_blank" rel="noreferrer" style={{ color: 'var(--theme-accent)', textDecoration: 'underline' }}>Pay via Venmo</a>
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-fg-muted)' }}>
            <em>Note: If you do not have Venmo, please DM me directly for alternative payment information.</em>
          </p>
        </div>

        <p style={{ lineHeight: '1.6' }}>
          The league culminates in a <strong>Final 2000-Point Tournament</strong>. At this grand finale, all Commanders will deploy their completed forces, and we will announce the overall campaign prizes for: <strong>Best Painted, Best Converted, Best Sportsmanship, and Best General</strong>.
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
          <li><strong>Play your game</strong> — use the Live VP Tracker in-app during the game to record scores. When done, <strong>BOTH players</strong> must submit their final report, complete with their perspective of the battle (lore) and their opponent's Honour ratings. <strong>The match will not conclude, and the globe will not update, until both reports are sealed.</strong></li>
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
              desc: 'Upload pictures of your finalized units to your Army Roster. For work-in-progress (WIP) updates like assembling, painting, and basing, please submit photos to the #wip channel under the slow-grow-2026 category in the Los Angeles Warhammer 40k Discord (https://discord.gg/RPKfeJMPN).',
            },
            {
              icon: '■',
              title: 'Matchups & Lore (Campaign Warzones)',
              desc: 'View the Global Warzone Board showing all ongoing and completed battles across the campaign. Select one of your Assigned Frontlines to update live VP scores, draft your narrative perspective of the engagement, and submit your final battle report with Honour ratings. Remember: both players must submit their report to finalize the match!',
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
          Thematic Override
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          Located at the top-right of your operational view is the <strong>Theme Override</strong> selector. Switch it to match your chosen army faction — Chaos, Tyranids, Orks, Necrons, and more — to adapt the visual styling of the entire interface.
        </p>
      </div>

      <div className="card">
        <h3 style={{ color: 'var(--theme-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '0.5rem' }}>
          Credits & Acknowledgements
        </h3>
        <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
          The immersive aesthetic of this simulation is made possible by the incredible work of the community. We extend our deepest gratitude to the following creators:
        </p>
        
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-fg)' }}>Campaign Imagery</h4>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--theme-fg-muted)', fontSize: '0.9rem' }}>
          <li>All environmental and theatre of war images contributed by <strong>Yaro</strong> (Discord: <em>iyaro87</em>). Massive props to him for bringing these battlefields to life!</li>
        </ul>

        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-fg)' }}>Typography</h4>
        <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', color: 'var(--theme-fg-muted)', fontSize: '0.9rem' }}>
          <li><strong>CaslonAntique</strong> by Typographer Mediengestaltung (<a href="https://www.1001fonts.com/users/steffmann/" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>CoreScript</strong> by 0dy5 (<a href="https://drive.google.com/file/d/1OcU1rt5E8ZI80RDm3gb0Vv651O41yFbO/view" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>EldarRunes</strong> (<a href="https://www.dafontfree.net/eldar-runes-normal-font/f122723.htm" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>Necron-Crypt</strong> by Mageek (<a href="https://strolen.com/author/Mageek" target="_blank" rel="noopener noreferrer">Strolen Link</a>, <a href="https://www.reddit.com/r/Necrontyr/comments/1qh1whk/necron_glyphs_otf_ttf_woff_and_woff2_font_files/" target="_blank" rel="noopener noreferrer">Reddit Post</a>)</li>
          <li><strong>OrkGlyphs</strong> © 1995 Dragon's Den Typefoundry (<a href="https://fonts2u.com/ork-glyphs.font" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>Simbiot</strong> by thomasaradea@gmail.com (<a href="https://letterarastudio.com/product/simbiot/" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>tau-40k</strong> by Nekneeb (<a href="https://fontstruct.com/fontstructions/show/1005383/tau_40k" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>ZarathustraBleeds</strong> by 203X (<a href="https://www.1001fonts.com/zarathustra-bleeds-font.html" target="_blank" rel="noopener noreferrer">Link</a>)</li>
          <li><strong>Zeus-Borne</strong> by Masyafi Studio (<a href="https://fontesk.com/zeus-borne-font/" target="_blank" rel="noopener noreferrer">Link</a>)</li>
        </ul>
      </div>
    </div>
  );
}
