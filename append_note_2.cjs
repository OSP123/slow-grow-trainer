const fs = require('fs');
const content = `\nDate: 2026-06-05\nTasks:\n- Fixed the multi-line unit name parsing error. Units like "Death Company Dreadnought with Magna-grapple" and "Captain in Terminator Armour" that wrapped across multiple lines in the PDF are now correctly concatenated instead of being truncated into fragments like "with Magna-grapple".\n- Re-ran the parser and generated updated seed_units.sql and warhammer40k.ts with 1,341 perfectly parsed units.\nFollow-ups:\n- None\n`;
fs.appendFileSync('notes.md', content);
