const fs = require('fs');

function extractUnits(filePath, factionName) {
  const html = fs.readFileSync(filePath, 'utf8');
  const lines = html.split('\n');
  
  let fullPayload = '';
  for (const line of lines) {
    const match = line.match(/self\.__next_f\.push\(\[1,"(.*)"\]\)/);
    if (match) {
      let content = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n');
      fullPayload += content;
    }
  }

  // Find all unit names
  // Format: "children":"UNIT NAME"}
  let currentIndex = 0;
  const units = [];
  while (true) {
    const nameStart = fullPayload.indexOf('"children":"', currentIndex);
    if (nameStart === -1) break;
    
    const nameContentStart = nameStart + 12;
    const nameEnd = fullPayload.indexOf('"', nameContentStart);
    if (nameEnd === -1) break;
    
    const name = fullPayload.substring(nameContentStart, nameEnd);
    currentIndex = nameEnd;
    
    if (name === name.toUpperCase() && name.length > 3 && !['LEADER', 'BATTLELINE', 'INFANTRY', 'CHARACTER', 'MONSTER', 'VEHICLE', 'SWARM', 'BEAST', 'MOUNTED', 'GRENADES', 'SMOKESCREEN', 'EPIC HERO'].includes(name) && !name.includes(' pts') && !name.includes('models')) {
      
      // Look for the next point value
      const ptsStart = fullPayload.indexOf(' pts"', currentIndex);
      if (ptsStart !== -1 && ptsStart - currentIndex < 1000) {
        // backtrack to find the number
        let numStart = ptsStart - 1;
        while (fullPayload[numStart] !== '"') {
          numStart--;
        }
        const ptsStr = fullPayload.substring(numStart + 1, ptsStart);
        const pts = parseInt(ptsStr, 10);
        if (!isNaN(pts)) {
          units.push({ name, pts });
        }
      }
    }
  }

  console.log(`Extracted from ${factionName}:`);
  const assaultUnits = units.filter(u => u.name.includes('ASSAULT'));
  console.log(assaultUnits);
}

extractUnits('public/11th-munitorum-field-manual/Warhammer 40,000_ Munitorum Field Manual_Blood_Angels.html', 'Blood Angels');
