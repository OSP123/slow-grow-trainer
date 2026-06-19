const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const htmlDir = path.join(__dirname, 'public/11th-munitorum-field-manual');
const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

const factionMap = {
  "ADEPTUS MECHANICUS": "Adeptus Mechanicus",
  "ADEPTUS SORORITAS": "Adepta Sororitas",
  "AELDARI": "Aeldari",
  "ASTRA MILITARUM": "Astra Militarum",
  "BLACK TEMPLARS": "Black Templars",
  "BLOOD ANGELS": "Blood Angels",
  "CHAOS DEMONS": "Chaos Daemons",
  "CHAOS KNIGHTS": "Chaos Knights",
  "CHAOS SPACE MARINES": "Chaos Space Marines",
  "CHAOS TITAN LEGIONS": "Chaos Titan Legions",
  "CUSTODES": "Adeptus Custodes",
  "DARK ANGELS": "Dark Angels",
  "DEATH GUARD": "Death Guard",
  "DEATHWATCH": "Deathwatch",
  "DRUKHARI": "Drukhari",
  "EMPERORS CHILDREN": "Emperor's Children",
  "GENESTEALER CULTS": "Genestealer Cults",
  "GREY KNIGHTS": "Grey Knights",
  "IMPERIAL AGENTS": "Agents of the Imperium",
  "IMPERIAL KNIGHTS": "Imperial Knights",
  "LEAGUES OF VOTANN": "Leagues of Votann",
  "NECRONS": "Necrons",
  "ORKS": "Orks",
  "SPACE MARINES": "Space Marines",
  "SPACE WOLVES": "Space Wolves",
  "TAU": "T'au Empire",
  "THOUSAND SONS": "Thousand Sons",
  "TITAN LEGIONS": "Titan Legions",
  "TYRANIDS": "Tyranids",
  "WORLD EATERS": "World Eaters"
};

async function run() {
  console.log("Deleting existing units...");
  const { error: delErr } = await supabase.from('unit_points').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error("Delete error:", delErr);
  }

  let allUnits = [];

  for (const file of files) {
    const filePath = path.join(htmlDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    $('script').each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && scriptContent.includes('$RS(')) {
        const match = scriptContent.match(/\$RS\("([^"]+)","([^"]+)"\)/);
        if (match) {
          const sourceId = match[1];
          const targetId = match[2];
          const sourceContent = $(`[id="${sourceId}"]`).html();
          const targetElement = $(`[id="${targetId}"]`);
          if (sourceContent && targetElement.length > 0) {
            targetElement.replaceWith(sourceContent);
          }
        }
      }
    });

    let factionRaw = $('.font-header.text-4xl').first().text().trim();
    if (!factionRaw) continue;
    const factionName = factionMap[factionRaw] || factionRaw;

    let foundUnitsHeader = false;
    let unitsCards = [];
    
    $('h3.text-4xl.font-header').each((i, el) => {
      if ($(el).text().trim() === 'UNITS') {
        foundUnitsHeader = true;
        const grid = $(el).nextAll('div').first().find('div.flex.flex-col.space-y-1.m-1');
        if (grid.length === 0) {
          $(el).parent().find('div.flex.flex-col.space-y-1.m-1').each((j, card) => unitsCards.push(card));
        } else {
          grid.each((j, card) => unitsCards.push(card));
        }
      }
    });

    if (!foundUnitsHeader || unitsCards.length === 0) {
      $('div.flex.flex-col.space-y-1.m-1').each((i, el) => {
          if ($(el).find('div.bg-slate-500').length > 0) unitsCards.push(el);
      });
    }

    const processedUnits = new Set();

    for (const card of unitsCards) {
      const $card = $(card);
      let unitName = $card.find('div.bg-slate-500').first().text().trim();
      
      if (!unitName || processedUnits.has(unitName)) continue;
      processedUnits.add(unitName);

      // Clean up internal quotes specifically for the database object name format if needed, 
      // but supabase-js handles strings safely without needing to double '' like in raw SQL
      // wait, the previous parser did .replace(/'/g, "''"). We don't need that for supabase-js.
      unitName = unitName.replace(/''/g, "'");

      const costTiers = [];
      const wargearOptions = [];

      $card.find('div.space-y-1').each((i, block) => {
        const $block = $(block);
        const headerText = $block.find('div.bg-slate-200 span').length > 0 
          ? $block.find('div.bg-slate-200 span').first().text().trim()
          : $block.find('div.bg-slate-200').first().text().trim();

        if (!headerText) return;

        if (headerText.includes('WARGEAR OPTIONS')) {
          $block.find('ul.leaders li').each((j, li) => {
            const spans = $(li).find('span');
            if (spans.length >= 2) {
              const wargearName = $(spans[0]).text().trim().replace(/''/g, "'");
              const pointsText = $(spans[1]).text().replace(/[^0-9]/g, '');
              if (wargearName && pointsText) {
                  wargearOptions.push({
                      name: wargearName,
                      points: parseInt(pointsText, 10)
                  });
              }
            }
          });
        } else if (headerText.includes('UNIT COSTS') || headerText.includes('UNITS COST')) {
          let escalation = null;
          if (headerText.includes('YOUR 2ND +')) escalation = '2nd+';
          else if (headerText.includes('YOUR 3RD +')) escalation = '3rd+';
          else if (headerText.includes('YOUR 4TH +')) escalation = '4th+';

          $block.find('ul.leaders li').each((j, li) => {
            const spans = $(li).find('span');
            if (spans.length >= 2) {
              const modelsText = $(spans[0]).text().replace(/[^0-9]/g, '');
              const pointsText = $(spans[1]).text().replace(/[^0-9]/g, '');
              if (modelsText && pointsText) {
                costTiers.push({
                  models: parseInt(modelsText, 10) || 1,
                  points: parseInt(pointsText, 10),
                  escalation: escalation
                });
              }
            }
          });
        }
      });

      if (costTiers.length > 0) {
        const basePoints = costTiers[0].points;
        allUnits.push({
          faction: factionName,
          unit_name: unitName,
          base_points: basePoints,
          cost_tiers: costTiers,
          wargear_options: wargearOptions
        });
      }
    }
  }

  console.log(`Prepared ${allUnits.length} units to insert. Inserting in batches...`);
  const BATCH_SIZE = 100;
  for (let i = 0; i < allUnits.length; i += BATCH_SIZE) {
    const batch = allUnits.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('unit_points').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i}:`, error);
    } else {
      console.log(`Inserted batch ${i} to ${i + batch.length}`);
    }
  }
  console.log("Done.");
}

run();
