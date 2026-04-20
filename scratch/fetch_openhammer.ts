import fs from 'fs';
import { UNITS_BY_FACTION } from '../src/data/warhammer40k.js';

const OPENHAMMER_URL = 'https://openhammer-api-production.up.railway.app';

async function main() {
  let sql = `-- Bridge missing points from OpenHammer API\n`;
  let bridgedCount = 0;

  for (const [faction, units] of Object.entries(UNITS_BY_FACTION)) {
    console.log(`Checking OpenHammer for ${faction}...`);
    try {
      const res = await fetch(`${OPENHAMMER_URL}/units?faction=${encodeURIComponent(faction)}`);
      if (res.ok) {
        const apiUnits = await res.json();
        
        for (const unit of units) {
          // Find the unit in the api response
          const match = apiUnits.find(u => u.name.toLowerCase() === unit.toLowerCase());
          if (match && match.points && typeof match.points.base === 'number') {
            const secureFaction = faction.replace(/'/g, "''");
            const secureUnit = unit.replace(/'/g, "''");
            
            sql += `UPDATE public.unit_points SET base_points = ${match.points.base} WHERE faction = '${secureFaction}' AND unit_name = '${secureUnit}' AND base_points = 0;\n`;
            bridgedCount++;
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch for ${faction}:`, e.message);
    }
  }

  console.log(`Bridged ${bridgedCount} units from OpenHammer API.`);
  fs.writeFileSync('../supabase/migrations/20260420000004_update_openhammer_points.sql', sql);
  console.log('Saved to supabase/migrations/20260420000004_update_openhammer_points.sql');
}

main().catch(console.error);
