const fs = require('fs');
const date = new Date().toISOString().split('T')[0];
const entry = `
Date: ${date}
Tasks:
  - Enhanced gothic framing on .card to be more pronounced with heavy, multi-layered brutalist borders, arched top highlights, and 3D iron corner rivets
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually
`;
if (!fs.existsSync('notes.md')) {
  fs.writeFileSync('notes.md', entry);
} else {
  fs.appendFileSync('notes.md', '\n' + entry);
}
