const fs = require('fs');
const date = new Date().toISOString().split('T')[0];
const entry = `
Date: ${date}
Tasks:
  - Fixed a bug where commanders removed via the admin panel still appeared in the Dashboard (War Effort Area). Filtered removed/paused profiles securely using case-insensitive status checks.
  - Filtered removed/paused commander profiles from globe mappings, narratives, and match wins.

Follow-ups:
  - None
`;
fs.appendFileSync('notes.md', entry);
