const fs = require('fs');
const content = `\nDate: 2026-06-08\nTasks:\n- Added a League Payment section directly to the Briefing page under the "Campaign Structure & Matchmaking" section.\n- Included the Venmo payment link and specific instructions to DM for alternative payment options.\nFollow-ups:\n- None\n`;
fs.appendFileSync('notes.md', content);
