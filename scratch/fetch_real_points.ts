import fs from 'fs';
import { UNITS_BY_FACTION } from '../src/data/warhammer40k.ts';

async function main() {
  console.log('Fetching Datasheets...');
  const dsCsvRaw = await fetch('https://wahapedia.ru/wh40k10ed/Datasheets.csv').then(r => r.text());
  
  console.log('Fetching Points...');
  const ptsCsvRaw = await fetch('https://wahapedia.ru/wh40k10ed/Datasheets_models_cost.csv').then(r => r.text());

  // Parse Datasheets: datasheet_id -> name
  // Format: datasheet_id|name|...
  const nameMap = new Map<string, string>();
  dsCsvRaw.split('\n').forEach(line => {
    const parts = line.split('|');
    if (parts.length >= 2) {
      nameMap.set(parts[0], parts[1].trim());
    }
  });

  // Parse Points: datasheet_id -> min(cost)
  // Format: datasheet_id|line|description|cost|
  const ptsMap = new Map<string, number>();
  ptsCsvRaw.split('\n').forEach(line => {
    const parts = line.split('|');
    if (parts.length >= 4) {
      const id = parts[0];
      const cost = parseInt(parts[3], 10);
      if (!isNaN(cost)) {
        const current = ptsMap.get(id);
        if (current === undefined || cost < current) {
          ptsMap.set(id, cost);
        }
      }
    }
  });

  // Create lookup table: Base Unit Name string -> cost number
  // E.g. "Weirdboy" -> 65
  const exactLookup = new Map<string, number>();
  for (const [id, name] of nameMap.entries()) {
    const pts = ptsMap.get(id);
    if (pts !== undefined) {
      exactLookup.set(name.toLowerCase(), pts);
      
      // Sometimes Wahapedia has names like "Captain in Gravis Armour", etc.
      // But let's strip out spaces or hyphens to make fuzzy matching if needed.
    }
  }

  function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  const fuzzyLookup = new Map<string, number>();
  for (const [name, pts] of exactLookup.entries()) {
    fuzzyLookup.set(normalize(name), pts);
  }

  let sql = `-- Update Database with Real Base Points\n`;
  let matches = 0;
  let misses = 0;

  for (const [faction, units] of Object.entries(UNITS_BY_FACTION)) {
    for (const unit of units) {
      // Find the cost
      let cost = exactLookup.get(unit.toLowerCase());
      if (cost === undefined) {
        cost = fuzzyLookup.get(normalize(unit));
      }
      
      if (cost !== undefined) {
        const secureUnit = unit.replace(/'/g, "''");
        sql += `UPDATE public.unit_points SET base_points = ${cost} WHERE unit_name = '${secureUnit}';\n`;
        matches++;
      } else {
        misses++;
      }
    }
  }

  console.log(`Matched: ${matches}, Missed: ${misses}`);
  fs.writeFileSync('../supabase/migrations/20260420000003_update_real_points.sql', sql);
  console.log('Generated supabase/migrations/20260420000003_update_real_points.sql');
}

main().catch(console.error);
