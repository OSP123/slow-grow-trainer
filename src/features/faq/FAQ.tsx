export default function FAQ() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Frequently Asked Questions</h2>
        <p style={{ color: 'var(--theme-fg-muted)' }}>Common inquiries regarding the Slow Grow Campaign.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: When does the campaign start and when is the last day to sign up?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> We are officially starting on July 1. The last day to sign up would be Saturday, June 27.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: What exactly is a "slow grow" campaign?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> A slow grow campaign is a structured way of gradually building and painting a new army over time. Instead of needing a full 2000-point army right away, players start small and add to their army in set increments (milestones), playing a game at each milestone. In our campaign, the milestones are set at 400-point increments.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: Can I use half-painted or primed models in the slow grow campaign?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> Absolutely. Our goal is to help commanders reduce their grey piles of shame and make progress on their armies. Bring your WIP, primed, or partially painted models to the table—what matters most is that you're getting games in and making progress over the course of the campaign!
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: What is the overall timeline for the slow grow campaign?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> The campaign runs for a total of 5 months. Each month, commanders are required to post an additional 400 points of units (built or painted) and play at least 1 recorded game. This structure scales smoothly from 400 points in Month 1 up to a full 2000-point army in Month 5!
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: Are Legends units allowed?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> Yes.
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: Is narrative allowed?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> Not only is it allowed, but encouraged! We have a section in your commander profile to fill in your lore and a section in the battle report for your game to add the story for your game. There will be a prize for best narrative at the final game. Plus, the plan is to have the training module transition into a crusade...
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Q: Does a narrative campaign mean that we can't play normal 40k games?</h4>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>
              <strong>A:</strong> No! Feel free to play either competitive or narrative games with your opponent. It's up to you and your opponent what type of game you want to play. The only restriction is the number of points you'll be playing with at each interval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
