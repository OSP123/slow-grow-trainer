const fs = require('fs');
const content = `\nDate: 2026-06-05\nTasks:\n- Fixed the ArmyRoster unit input UI. Replaced the hidden datalist with a proper native <select> dropdown so that all parsed Munitorum Field Manual units (like the 30 World Eaters units) are immediately visible to the user without needing to start typing.\n- Investigated the parser and confirmed the database is accurately populated with all 1,338 units.\nFollow-ups:\n- None\n`;
fs.appendFileSync('notes.md', content);
