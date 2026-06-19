const fs = require('fs');
const content = `\nDate: 2026-06-08\nTasks:\n- Added a new question and answer to the FAQ section in Briefing.tsx regarding the campaign start date (July 1) and the final sign-up date (June 27).\nFollow-ups:\n- None\n`;
fs.appendFileSync('notes.md', content);
