const fs = require('fs');
const date = new Date().toISOString().split('T')[0];
const entry = `
Date: ${date}
Tasks:
  - Replaced vector borders with the explicit generated Imperial Gothic Frame PNG (gothic_ui_frame_1781133732185.png) mapped to .card via border-image slice and stretch to serve as both the dark background and the gothic outer structural framing as requested.
Follow-ups:
  - Keep an eye on mobile performance feedback; tune CSS ember count if needed
  - Update algorithm for minitorum field manual with points based on wargear eventually
`;
if (!fs.existsSync('notes.md')) {
  fs.writeFileSync('notes.md', entry);
} else {
  fs.appendFileSync('notes.md', '\n' + entry);
}
