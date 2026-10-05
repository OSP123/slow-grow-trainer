// Generate a migration that adds every Legends unit from the 11th Edition
// Munitorum Field Manual site to `unit_points`.
//
// The 11th Edition seed (scratch/parse_mfm_html.cjs) was built from pages saved
// with the site's "Show Legends" toggle off, so no Legends unit ever reached the
// registry. That toggle is a server action that sets the `isLegendsDisplayed`
// cookie; sending the cookie makes the server render a LEGENDS section on every
// faction page, with current points.
//
// Usage: node scripts/import_mfm_legends.mjs <migration-file.sql>
//
// The SQL only inserts units the registry does not already hold (matched on
// faction + case-insensitive name), so it never touches existing rows or the
// points an admin has edited.

import fs from 'fs';
import * as cheerio from 'cheerio';

const BASE = 'https://mfm.warhammer-community.com/en/';

// Site slug -> faction name as stored in unit_points.
const FACTIONS = {
  'adepta-sororitas': 'Adepta Sororitas',
  'adeptus-custodes': 'Adeptus Custodes',
  'adeptus-mechanicus': 'Adeptus Mechanicus',
  'aeldari': 'Aeldari',
  'astra-militarum': 'Astra Militarum',
  'black-templars': 'Black Templars',
  'blood-angels': 'Blood Angels',
  'chaos-daemons': 'Chaos Daemons',
  'chaos-knights': 'Chaos Knights',
  'chaos-space-marines': 'Chaos Space Marines',
  'chaos-titan-legions': 'Chaos Titan Legions',
  'dark-angels': 'Dark Angels',
  'death-guard': 'Death Guard',
  'deathwatch': 'Deathwatch',
  'drukhari': 'Drukhari',
  'emperors-children': "Emperor's Children",
  'genestealer-cults': 'Genestealer Cults',
  'grey-knights': 'Grey Knights',
  'imperial-agents': 'Agents of the Imperium',
  'imperial-knights': 'Imperial Knights',
  'leagues-of-votann': 'Leagues of Votann',
  'necrons': 'Necrons',
  'orks': 'Orks',
  'space-marines': 'Space Marines',
  'space-wolves': 'Space Wolves',
  'tau-empire': "T'au Empire",
  'thousand-sons': 'Thousand Sons',
  'titan-legions': 'Titan Legions',
  'tyranids': 'Tyranids',
  'world-eaters': 'World Eaters',
};

const CARD = 'div.flex.flex-col.space-y-1.m-1';

// Same rule the existing registry names were cased with (scratch/generate_divergent_seed.cjs).
export function titleCase(str) {
  const exceptions = ['with', 'and', 'of', 'the', 'in', 'on', 'a', 'an', 'for'];
  return str.split(' ').map((word, i) => {
    const lower = word.toLowerCase();
    if (i !== 0 && exceptions.includes(lower)) return lower;
    return word.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}

// Names the generic rule gets wrong: apostrophised T'au/Eldar names, weapon
// designations and hyphenated ranks. Keyed by the rule's output.
export const NAME_FIXES = {
  '‘iron Hand’ Straken': '‘Iron Hand’ Straken',
  'Tx42 Piranha': 'TX42 Piranha',
  'Xv9 Hazard Battlesuits': 'XV9 Hazard Battlesuits',
  'Aun’shi': 'Aun’Shi',
  'Aun’va': 'Aun’Va',
  'Shas’o R’alai': 'Shas’O R’alai',
  'Brother-captain Stern': 'Brother-Captain Stern',
  'Lion El’jonson': 'Lion El’Jonson',
  'Ax-1-0 Tiger Shark': 'AX-1-0 Tiger Shark',
};

export const unitName = raw => NAME_FIXES[titleCase(raw)] ?? titleCase(raw);

async function fetchPage(slug) {
  const res = await fetch(BASE + slug, {
    headers: { 'User-Agent': 'Mozilla/5.0', Cookie: 'isLegendsDisplayed=true; NEXT_LOCALE=en' },
  });
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  return res.text();
}

/** Every unit card on a page, tagged with the h3 section it sits under. */
export function parseUnits(html) {
  const $ = cheerio.load(html);

  // Points are streamed in later as Suspense chunks; splice them into place.
  $('script').each((_, el) => {
    const m = ($(el).html() || '').match(/\$RS\("([^"]+)","([^"]+)"\)/);
    if (!m) return;
    const source = $(`[id="${m[1]}"]`).html();
    const target = $(`[id="${m[2]}"]`);
    if (source && target.length) target.replaceWith(source);
  });

  const units = [];
  const seen = new Set();
  let section = null;
  // A multi-selector returns matches in document order, so the last h3 seen
  // is the section a card belongs to however deeply either is nested.
  $(`h3, ${CARD}`).each((_, el) => {
    const $el = $(el);
    if (el.tagName === 'h3') { section = $el.text().trim(); return; }

    const name = $el.find('div.bg-slate-500').first().text().trim();
    if (!name || seen.has(name)) return;

    const costTiers = [];
    const wargearOptions = [];
    $el.find('div.space-y-1').each((_, block) => {
      const $block = $(block);
      const header = $block.find('div.bg-slate-200').first().text().trim();
      const rows = $block.find('ul.leaders li').map((_, li) => {
        const spans = $(li).find('span');
        return spans.length >= 2 ? [[$(spans[0]).text().trim(), $(spans[1]).text().trim()]] : [];
      }).get();

      if (header.includes('WARGEAR OPTIONS')) {
        for (const [label, pts] of rows) {
          const points = parseInt(pts.replace(/[^0-9]/g, ''), 10);
          if (label && points) wargearOptions.push({ name: label, points });
        }
      } else if (header.includes('UNIT COSTS') || header.includes('UNITS COST')) {
        const escalation = header.match(/YOUR (\d+(?:ST|ND|RD|TH)) ?\+/)?.[1].toLowerCase().concat('+') ?? null;
        for (const [label, pts] of rows) {
          const models = parseInt(label.replace(/[^0-9]/g, ''), 10) || 1;
          const points = parseInt(pts.replace(/[^0-9]/g, ''), 10);
          if (!Number.isNaN(points)) costTiers.push({ models, points, escalation });
        }
      }
    });

    if (costTiers.length === 0) return;
    seen.add(name);
    units.push({ section, name, costTiers, wargearOptions });
  });
  return units;
}

const sql = s => `'${s.replace(/'/g, "''")}'`;

async function main() {
  const out = process.argv[2];
  if (!out) {
    console.error('Usage: node scripts/import_mfm_legends.mjs <migration-file.sql>');
    process.exit(1);
  }

  const legends = [];
  for (const [slug, faction] of Object.entries(FACTIONS)) {
    // Several factions (Custodes, the Knights, Votann...) simply have no Legends.
    const units = parseUnits(await fetchPage(slug)).filter(u => u.section === 'LEGENDS');
    for (const u of units) legends.push({ faction, ...u });
    console.log(`${faction}: ${units.length} Legends units`);
  }
  if (legends.length === 0) {
    throw new Error('No LEGENDS section on any page -- the isLegendsDisplayed cookie may no longer work.');
  }

  const values = legends.map(u => `    (${[
    sql(u.faction),
    sql(unitName(u.name)),
    u.costTiers[0].points,
    `${sql(JSON.stringify(u.costTiers))}::jsonb`,
    `${sql(JSON.stringify(u.wargearOptions))}::jsonb`,
  ].join(', ')})`);

  fs.writeFileSync(out, `-- Legends units from the 11th Edition Munitorum Field Manual.
-- Generated by scripts/import_mfm_legends.mjs on ${new Date().toISOString().slice(0, 10)}.
--
-- The 11th Edition seed was built from pages saved with "Show Legends" switched
-- off, so no faction had any Legends units. This adds ${legends.length} of them. A unit the
-- registry already holds (same faction, name ignoring case) is skipped, so
-- existing rows and admin-edited points are never touched, and re-running this
-- is harmless.

INSERT INTO public.unit_points (faction, unit_name, base_points, cost_tiers, wargear_options)
SELECT v.faction, v.unit_name, v.base_points, v.cost_tiers, v.wargear_options
FROM (VALUES
${values.join(',\n')}
) AS v(faction, unit_name, base_points, cost_tiers, wargear_options)
WHERE NOT EXISTS (
    SELECT 1 FROM public.unit_points u
    WHERE u.faction = v.faction AND lower(u.unit_name) = lower(v.unit_name)
);
`);
  console.log(`\n${legends.length} Legends units written to ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error(e); process.exit(1); });
