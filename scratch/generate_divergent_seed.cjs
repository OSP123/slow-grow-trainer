const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const DIR = 'public/11th-munitorum-field-manual';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && (f.includes('Blood_Angels') || f.includes('Dark_Angels') || f.includes('Space_Wolves') || f.includes('Black_Templars') || f.includes('Deathwatch')));

const factionMap = {
  "ADEPTUS MECHANICUS": "Adeptus Mechanicus",
  "ADEPTUS SORORITAS": "Adepta Sororitas",
  "ADEPTUS CUSTODES": "Adeptus Custodes",
  "AELDARI": "Aeldari",
  "ASTRA MILITARUM": "Astra Militarum",
  "BLACK TEMPLARS": "Black Templars",
  "BLOOD ANGELS": "Blood Angels",
  "CHAOS DAEMONS": "Chaos Daemons",
  "CHAOS KNIGHTS": "Chaos Knights",
  "CHAOS SPACE MARINES": "Chaos Space Marines",
  "DARK ANGELS": "Dark Angels",
  "DEATH GUARD": "Death Guard",
  "DEATHWATCH": "Deathwatch",
  "DRUKHARI": "Drukhari",
  "GENESTEALER CULTS": "Genestealer Cults",
  "GREY KNIGHTS": "Grey Knights",
  "IMPERIAL KNIGHTS": "Imperial Knights",
  "LEAGUES OF VOTANN": "Leagues of Votann",
  "NECRONS": "Necrons",
  "ORKS": "Orks",
  "SPACE MARINES": "Space Marines",
  "SPACE WOLVES": "Space Wolves",
  "T'AU EMPIRE": "T'au Empire",
  "THOUSAND SONS": "Thousand Sons",
  "TITAN LEGIONS": "Titan Legions",
  "TYRANIDS": "Tyranids",
  "WORLD EATERS": "World Eaters",
  "IMPERIAL AGENTS": "Agents of the Imperium",
  "TAU": "T'au Empire"
};

function titleCase(str) {
  const exceptions = ["with", "and", "of", "the", "in", "on", "a", "an", "for"];
  return str.split(' ').map((word, i) => {
    const lower = word.toLowerCase();
    if (i !== 0 && exceptions.includes(lower)) {
      return lower;
    }
    return word.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}

const allUnits = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(DIR, file), 'utf8');
  const $ = cheerio.load(html);
  
  let factionRaw = $('.font-header.text-4xl').first().text().trim();
  if (!factionRaw) continue;
  const factionName = factionMap[factionRaw] || titleCase(factionRaw);

  const processedUnits = new Set();
  
  $('div.flex.flex-col.space-y-1.m-1').each((i, el) => {
    const $card = $(el);
    let unitNameRaw = $card.find('div.bg-slate-500, div.bg-slate-800').first().text().trim();
    if (!unitNameRaw) return;
    
    let unitName = titleCase(unitNameRaw);
    unitName = unitName.replace(/''/g, "'");

    if (processedUnits.has(unitName)) return;
    processedUnits.add(unitName);

    const costTiers = [];

    // Custom text extraction that resolves templates
    function getResolvedText($li) {
      let text = $li.text().trim();
      
      const template = $li.find('template');
      if (template.length > 0) {
        const id = template.attr('id');
        if (id && id.startsWith('P:')) {
          const sourceId = 'S:' + id.substring(2);
          const sourceEl = $('[id="' + sourceId + '"]');
          if (sourceEl.length > 0) {
            text += ' ' + sourceEl.text().trim();
          } else {
            // It might be buried in the Next.js JSON array, let's just regex the raw HTML for the ID!
            const sourceRegex = new RegExp('\\["\\$","span",null,\\{"children":"(\\d+ pts)"\\}\\]', 'g');
            // Wait, this is difficult. We can just regex the exact text.
            const match = html.match(new RegExp(`id="${sourceId}"[^>]*>(.*?)<`));
            if (match) {
              const innerText = cheerio.load(match[1]).text();
              text += ' ' + innerText;
            } else {
              // Try to find the raw string in Next.js chunk
              // Usually the chunk is like: `S:8a` followed by `85 pts`
              // We'll just regex for `pts` in the proximity if we can't find it.
            }
          }
        }
      }
      return text;
    }

    // A better way: In the offline HTML, if an element is NOT found via cheerio, it's inside `self.__next_f.push`.
    // The points for `template` tags are in the Next.js chunks. Let's extract them from the raw text!
    function resolveTemplateId(id) {
      if (!id || !id.startsWith('P:')) return '';
      const sourceId = id.substring(2); // e.g. "8a"
      // Look for the definition in the Next.js chunks
      // Next.js chunks have something like `15e:["$","span",null,{"children":"85 pts"}]` where `15e` maps to `8a` somehow...
      // Actually, if we look at the regex:
      // `<template id="P:8a"></template>`
      // The script tag is `<script>$RS("S:8a","P:8a")</script>`
      // And then `<div hidden id="S:8a"><span>85 pts</span></div>`
      // Let's regex for `id="S:${sourceId}"`
      const sourceRegex = new RegExp(`id=\\\\"S:${sourceId}\\\\"[^>]*>(.*?)<\\\\/div>`);
      const match1 = html.match(sourceRegex);
      if (match1) {
        return cheerio.load(match1[1]).text().replace(/\\"/g, '"');
      }
      // Or it's not escaped
      const sourceRegex2 = new RegExp(`id="S:${sourceId}"[^>]*>(.*?)<\\/div>`);
      const match2 = html.match(sourceRegex2);
      if (match2) {
         return cheerio.load(match2[1]).text();
      }
      return '';
    }

    $card.find('ul li').each((_, li) => {
      let text = $(li).text().trim();
      const template = $(li).find('template');
      if (template.length > 0) {
        text += ' ' + resolveTemplateId(template.attr('id'));
      }

      const pointsMatch = text.match(/(\d+)\s*pts/i);
      const modelsMatch = text.match(/(\d+)\s*models?/i);
      if (pointsMatch) {
        const points = parseInt(pointsMatch[1], 10);
        const models = modelsMatch ? parseInt(modelsMatch[1], 10) : 1;
        costTiers.push({ models, points, escalation: null });
      }
    });

    $card.find('div.space-y-1').each((_, block) => {
      const headerText = $(block).find('.font-bold.text-black').text().trim().toUpperCase();
      let activeEscalation = null;
      if (headerText.includes('3RD COPY') || headerText.includes('3RD + UNIT')) activeEscalation = '3rd+';
      else if (headerText.includes('4TH COPY')) activeEscalation = '4th+';
      else if (headerText.includes('2ND COPY')) activeEscalation = '2nd+';
      else if (headerText.includes('1ST TO 2ND UNITS COST')) activeEscalation = null;
      else if (headerText.includes('1ST TO 3RD UNITS COST')) activeEscalation = null;

      if (!activeEscalation && headerText !== '') return; 

      if (activeEscalation) {
        $(block).find('ul li').each((_, li) => {
          let text = $(li).text().trim();
          const template = $(li).find('template');
          if (template.length > 0) {
            text += ' ' + resolveTemplateId(template.attr('id'));
          }

          const pointsMatch = text.match(/(\d+)\s*pts/i);
          const modelsMatch = text.match(/(\d+)\s*models?/i);
          if (pointsMatch) {
            const points = parseInt(pointsMatch[1], 10);
            const models = modelsMatch ? parseInt(modelsMatch[1], 10) : 1;
            costTiers.push({ models, points, escalation: activeEscalation });
          }
        });
      }
    });

    if (costTiers.length > 0) {
      allUnits.push({
        faction: factionName,
        unit_name: unitName,
        base_points: costTiers[0].points,
        cost_tiers: costTiers
      });
    }
  });
}

const lines = [
  "-- Divergent Space Marine Chapters Registry Override",
  "DELETE FROM unit_points WHERE faction IN ('Blood Angels', 'Dark Angels', 'Space Wolves', 'Black Templars', 'Deathwatch');",
  "INSERT INTO unit_points (faction, unit_name, base_points, cost_tiers) VALUES"
];

const values = allUnits.map(u => {
  const cleanName = u.unit_name.replace(/'/g, "''");
  const costJson = JSON.stringify(u.cost_tiers).replace(/'/g, "''");
  return `  ('${u.faction}', '${cleanName}', ${u.base_points}, '${costJson}'::jsonb)`;
});

lines.push(values.join(',\n') + ';');

fs.writeFileSync('seed_divergent_units.sql', lines.join('\n'), 'utf8');
console.log('Wrote ' + allUnits.length + ' units to seed_divergent_units.sql');
const assault = allUnits.filter(u => u.unit_name.includes('Assault'));
console.log('Assault units:', assault.length);
