/**
 * Munitorum Field Manual PDF Parser v6
 *
 * Merges v5's Legends and multi-line parsing with v4's cost_tiers parsing.
 * Extracts every model count variant for a unit (e.g. 5 models, 10 models)
 * and inserts it into the `cost_tiers` JSONB column in Supabase.
 */
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
let inEnhancements = false;
const unitsMap = new Map();

let expectingNewUnit = true;

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
    inEnhancements = false;
    expectingNewUnit = true;
    continue;
  }

  if (line === 'LEGENDS FIELD MANUAL') {
    inLegends = true;
    inEnhancements = false;
    expectingNewUnit = true;
    continue;
  }

  if (inLegends && line === line.toUpperCase() && line.length > 3 && !POINTS_RE.test(line) && !MODEL_RE.test(line)) {
    const mapped = FACTION_MAP[line];
    if (mapped) {
      currentFaction = mapped;
      lastUnitName = null;
      inEnhancements = false;
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

  // ── Points line ──
  const ptsMatch = line.match(POINTS_RE);
  if (ptsMatch) {
    if (MODEL_RE.test(line)) {
      // Unit points line — has model count
      if (lastUnitName) {
        const points = parseInt(ptsMatch[1], 10);
        const modelMatch = line.match(/^(\d+)\s+model/);
        const models = modelMatch ? parseInt(modelMatch[1], 10) : 1;

        const key = `${currentFaction}|||${lastUnitName}`;
        if (!unitsMap.has(key)) {
          unitsMap.set(key, {
            faction: currentFaction,
            unit_name: lastUnitName,
            base_points: points,
            cost_tiers: []
          });
        }
        
        // Add to cost_tiers
        unitsMap.get(key).cost_tiers.push({ models, points });
      }
    }
    expectingNewUnit = true;
    continue;
  }

  // ── Model count line without pts (shouldn't happen normally) ──
  if (MODEL_RE.test(line)) {
    expectingNewUnit = true;
    continue;
  }

  // ── Otherwise: unit name ──
  if (line.split(/\s+/).length > 10) {
    expectingNewUnit = true;
    continue; // Ignore explanatory paragraphs
  }

  if (expectingNewUnit) {
    lastUnitName = line;
    expectingNewUnit = false;
  } else if (lastUnitName) {
    lastUnitName += ' ' + line;
  }
}

const units = Array.from(unitsMap.values());

// ── Report ──
const counts = {};
units.forEach(u => { counts[u.faction] = (counts[u.faction] || 0) + 1; });

console.log('\n=== UNITS PER FACTION ===');
const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
let total = 0;
for (const [faction, count] of sorted) {
  console.log(`  ${faction}: ${count}`);
  total += count;
}
console.log(`\nTOTAL UNITS: ${total}`);

// ── Generate SQL ──
let sql = `-- Munitorum Field Manual v6 - Complete Unit Points Registry\n`;
sql += `-- Generated ${new Date().toISOString()}\n`;
sql += `-- Total units: ${units.length}\n\n`;
sql += `DELETE FROM unit_points;\n\n`;
sql += `INSERT INTO unit_points (faction, unit_name, base_points, cost_tiers)\nVALUES\n`;

const values = units.map(u => {
  const safeFaction = u.faction.replace(/'/g, "''");
  const safeUnit = u.unit_name.replace(/'/g, "''");
  const costTiersJson = JSON.stringify(u.cost_tiers).replace(/'/g, "''");
  return `  ('${safeFaction}', '${safeUnit}', ${u.base_points}, '${costTiersJson}'::jsonb)`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('seed_units.sql', sql);
console.log(`\nGenerated seed_units.sql with ${units.length} units.`);
