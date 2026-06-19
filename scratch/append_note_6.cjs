const fs = require('fs');
const content = `\nDate: 2026-06-08\nTasks:\n- Updated the credits section in the Briefing page to include Mageek's Reddit post link for the Necrons font alongside the original Strolen link.\nFollow-ups:\n- None\n`;
fs.appendFileSync('notes.md', content);
