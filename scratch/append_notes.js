const fs = require('fs');
const date = new Date().toISOString().split('T')[0];
const entry = `
Date: ${date}
Tasks:
  - Replaced laser click sound with a percussive mechanical white-noise clack
  - Fixed 400 error in CampaignQuests component by correcting 'user_id' to 'profile_id' in army_units query
  - Detailed to user how to test matchmaker algorithms using existing Admin Dashboard Dry Run Preview feature without relying on fake data
  - Fixed UI horizontal overflow bug on mobile devices for the weapons tables in both custom Commander Profile Viewer and Builder
Follow-ups:
  - Update algorithm for minitorum field manual with points based on wargear eventually
`;
if (!fs.existsSync('notes.md')) {
  fs.writeFileSync('notes.md', entry);
} else {
  fs.appendFileSync('notes.md', '\n' + entry);
}
