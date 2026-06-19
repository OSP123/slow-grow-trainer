/**
 * Munitorum Field Manual PDF Parser v4 — Final
 *
 * Uses the linear pdftotext output (which correctly interleaves columns in
 * reading order). Parses faction headers, unit names, and points lines.
 * Skips detachment enhancements and noise.
 *
 * Key fix over previous versions: In the Legends section, only treats all-caps
 * lines as faction headers if they match a KNOWN faction name. This prevents
 * unit names like "X-101" and "UR-025" from being treated as factions.
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
let inEnhancements = false;
let inLegends = false;
let wasPointsLine = false;
const unitsMap = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = clean(lines[i]);
  if (!line) continue;

  // ── Faction headers (CODEX: / INDEX: / CODEX SUPPLEMENT:) ──
  if (line.startsWith('CODEX:') || line.startsWith('INDEX:') || line.startsWith('CODEX SUPPLEMENT:')) {
    const factionRaw = line.replace(/^(?:CODEX|INDEX|CODEX SUPPLEMENT):\s*/, '').trim();
    currentFaction = FACTION_MAP[factionRaw] || factionRaw;
    inEnhancements = false;
    lastUnitName = null;
    continue;
  }

  // ── Legends marker ──
  if (line === 'LEGENDS FIELD MANUAL') {
    inLegends = true;
    continue;
  }

  // ── In Legends: detect faction headers (must match known faction) ──
  if (inLegends && line === line.toUpperCase() && line.length > 3
      && !POINTS_RE.test(line) && !MODEL_RE.test(line)) {
    const mapped = FACTION_MAP[line];
    if (mapped) {
      currentFaction = mapped;
      inEnhancements = false;
      lastUnitName = null;
      continue;
    }
    // NOT a known faction — fall through and treat as unit name
  }

  // ── Detachment enhancements — skip ──
  if (line === 'DETACHMENT ENHANCEMENTS' || line.startsWith('DETACHMENT ENHANCEMENTS')) {
    inEnhancements = true;
    continue;
  }

  // ── FORGE WORLD — re-enable unit parsing ──
  if (line.startsWith('FORGE WORLD POINTS VALUES')) {
    inEnhancements = false;
    lastUnitName = null;
    continue;
  }

  // ── Noise ──
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
    wasPointsLine = true;
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
        
        // Add to cost tiers
        unitsMap.get(key).cost_tiers.push({ models, points });
      }
    }
    // Enhancement pts lines (no model count) — skip
    continue;
  }

  // ── Model count line without pts (shouldn't happen normally) ──
  if (MODEL_RE.test(line)) {
    wasPointsLine = true;
    continue;
  }

  // ── Otherwise: unit name ──
  const wordCount = line.split(/\s+/).length;
  if (wordCount > 12) {
    continue; // Ignore explanatory paragraphs (e.g. Agents of the Imperium notes)
  }

  if (wasPointsLine || !lastUnitName) {
    lastUnitName = line;
  } else {
    lastUnitName += ' ' + line;
  }
  
  wasPointsLine = false;
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
let sql = `-- Munitorum Field Manual v4.3 - Complete Unit Points Registry\n`;
sql += `-- Generated ${new Date().toISOString()}\n`;
sql += `-- Total units: ${units.length}\n\n`;
sql += `DELETE FROM unit_points;\n\n`;
sql += `INSERT INTO unit_points (faction, unit_name, base_points, cost_tiers)\nVALUES\n`;

const values = units.map(u => {
  const safeFaction = u.faction.replace(/'/g, "''");
  const safeUnit = u.unit_name.replace(/'/g, "''");
  const tiersJson = JSON.stringify(u.cost_tiers).replace(/'/g, "''");
  return `  ('${safeFaction}', '${safeUnit}', ${u.base_points}, '${tiersJson}'::jsonb)`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('seed_units.sql', sql);
console.log(`\nGenerated seed_units.sql with ${units.length} units.`);
