const fs = require('fs');
const rawText = fs.readFileSync('public/munitorum_blocks.txt', 'utf-8');
const lines = rawText.split('\n');

const FACTION_MAP = {
  'ADEPTA SORORITAS': 'Adepta Sororitas',
  'ADEPTUS CUSTODES': 'Adeptus Custodes',
  'ADEPTUS MECHANICUS': 'Adeptus Mechanicus',
  'ADEPTUS TITANICUS': 'Adeptus Titanicus',
  'AELDARI': 'Aeldari',
  'ASTRA MILITARUM': 'Astra Militarum',
  'BLACK TEMPLARS': 'Black Templars',
  'BLOOD ANGELS': 'Blood Angels',
  'CHAOS DAEMONS': 'Chaos Daemons',
  'CHAOS KNIGHTS': 'Chaos Knights',
  'CHAOS SPACE MARINES': 'Chaos Space Marines',
  'DARK ANGELS': 'Dark Angels',
  'DEATH GUARD': 'Death Guard',
  'DEATHWATCH': 'Deathwatch',
  'DRUKHARI': 'Drukhari',
  "EMPEROR'S CHILDREN": "Emperor's Children",
  "EMPEROR\u2019S CHILDREN": "Emperor's Children",
  'GENESTEALER CULTS': 'Genestealer Cults',
  'GREY KNIGHTS': 'Grey Knights',
  'IMPERIAL AGENTS': 'Imperial Agents',
  'IMPERIAL KNIGHTS': 'Imperial Knights',
  'LEAGUES OF VOTANN': 'Leagues of Votann',
  'NECRONS': 'Necrons',
  'ORKS': 'Orks',
  'SPACE MARINES': 'Space Marines',
  'SPACE WOLVES': 'Space Wolves',
  "T\u2019AU EMPIRE": "T'au Empire",
  "T'AU EMPIRE": "T'au Empire",
  'THOUSAND SONS': 'Thousand Sons',
  'TYRANIDS': 'Tyranids',
  'WORLD EATERS': 'World Eaters',
  'AGENTS OF THE IMPERIUM': 'Imperial Agents',
  'ULTRAMARINES': 'Ultramarines',
  'UNALIGNED FORCES': 'Unaligned Forces',
};

function clean(s) {
  return s.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
}

const POINTS_RE = /(\d+)\s*pts\s*$/;
const MODEL_RE = /^\d+\s+models?\b/;

let currentFaction = null;
let lastUnitName = null;
let inLegends = false;
let expectingNewUnit = true;
const unitsMap = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = clean(lines[i]);
  if (!line) continue;

  if (line.startsWith('CODEX:') || line.startsWith('INDEX:') || line.startsWith('CODEX SUPPLEMENT:')) {
    let factionRaw = line.replace(/^(?:CODEX|INDEX|CODEX SUPPLEMENT):\s*/, '').trim();
    if (!factionRaw && i + 1 < lines.length) {
      factionRaw = clean(lines[i + 1]);
      i++;
    }
    currentFaction = FACTION_MAP[factionRaw] || factionRaw;
    lastUnitName = null;
    expectingNewUnit = true;
    continue;
  }

  if (line === 'LEGENDS FIELD MANUAL') {
    inLegends = true;
    expectingNewUnit = true;
    continue;
  }

  if (inLegends && line === line.toUpperCase() && line.length > 3 && !POINTS_RE.test(line) && !MODEL_RE.test(line)) {
    const mapped = FACTION_MAP[line];
    if (mapped) {
      currentFaction = mapped;
      lastUnitName = null;
      expectingNewUnit = true;
      continue;
    }
  }

  if (line === 'DETACHMENT ENHANCEMENTS' || line.startsWith('DETACHMENT ENHANCEMENTS')) {
    expectingNewUnit = true;
    continue;
  }
  if (line.startsWith('FORGE WORLD POINTS VALUES')) {
    lastUnitName = null;
    expectingNewUnit = true;
    continue;
  }

  if (/^\d+$/.test(line)) continue;
  if (line.includes('PRODUCED BY THE WARHAMMER DESIGN STUDIO')) continue;
  if (line.includes('Munitorum Field Manual')) continue;
  if (line.includes('©')) continue;
  if (line === 'CONTENTS') continue;
  if (line.includes('ARMY FACTION:')) continue;
  if (line.includes('LEGIONS OF EXCESS')) continue;
  if (line.startsWith('WA R HA M M E R')) continue;
  if (line.startsWith('The points values shown below')) continue;
  if (line.startsWith('in Legends Approved battles')) continue;
  if (line.startsWith('organisers if Warhammer')) continue;
  if (line.startsWith('You can use the points values')) continue;
  if (line.startsWith('when assembling your armies')) continue;

  if (!currentFaction) continue;

  const ptsMatch = line.match(POINTS_RE);
  if (ptsMatch) {
    if (MODEL_RE.test(line)) {
      if (lastUnitName) {
        const key = `${currentFaction}|||${lastUnitName}`;
        if (!unitsMap.has(key)) {
          unitsMap.set(key, { faction: currentFaction, unit_name: lastUnitName });
        }
      }
    }
    expectingNewUnit = true;
    continue;
  }

  if (MODEL_RE.test(line)) {
    expectingNewUnit = true;
    continue;
  }

  if (line.split(/\s+/).length > 10) {
    expectingNewUnit = true;
    continue;
  }

  if (expectingNewUnit) {
    lastUnitName = line;
    expectingNewUnit = false;
  } else if (lastUnitName) {
    lastUnitName += ' ' + line;
  }
}

const units = Array.from(unitsMap.values());
const unitsByFaction = {};
units.forEach(u => {
  if (!unitsByFaction[u.faction]) unitsByFaction[u.faction] = [];
  unitsByFaction[u.faction].push(u.unit_name);
});

let tsCode = `export const UNITS_BY_FACTION: Record<string, string[]> = {\n`;
const sortedFactions = Object.keys(unitsByFaction).sort();
for (const faction of sortedFactions) {
  tsCode += `  '${faction.replace(/'/g, "\\'")}': [\n`;
  const sortedUnits = unitsByFaction[faction].sort();
  for (let i=0; i<sortedUnits.length; i+=4) {
    const chunk = sortedUnits.slice(i, i+4).map(u => `'${u.replace(/'/g, "\\'")}'`).join(', ');
    tsCode += `    ${chunk},\n`;
  }
  tsCode += `  ],\n`;
}
tsCode += `};\n`;

let tsFile = fs.readFileSync('src/data/warhammer40k.ts', 'utf8');
tsFile = tsFile.replace(/export const UNITS_BY_FACTION: Record<string, string\[]> = {[\s\S]*?};\n/, tsCode);
fs.writeFileSync('src/data/warhammer40k.ts', tsFile);
console.log("Updated warhammer40k.ts with " + units.length + " units across " + sortedFactions.length + " factions.");
