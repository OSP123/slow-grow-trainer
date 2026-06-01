import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  const txtPath = path.join(__dirname, '../public/munitorum_linear.txt');
  
  if (!fs.existsSync(txtPath)) {
    console.error('Text file not found. Run pdftotext public/munitorum_manual.pdf public/munitorum_linear.txt');
    process.exit(1);
  }

  const rawText = fs.readFileSync(txtPath, 'utf-8');
  const lines = rawText.split('\n').map(l => l.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim());

  let currentFaction: string | null = null;
  let currentUnitName: string | null = null;
  let skipSection = false;

  const unitsMap = new Map<string, any>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) continue;

    // Faction Headers
    if (line.startsWith('CODEX:') || line.startsWith('INDEX:') || line.startsWith('CODEX SUPPLEMENT:')) {
      currentFaction = line.split(':')[1].trim();
      
      // Fix weird title casing if necessary
      if (currentFaction === 'ADEPTA SORORITAS') currentFaction = 'Adepta Sororitas';
      else if (currentFaction === 'SPACE MARINES') currentFaction = 'Space Marines';
      else if (currentFaction === 'ASTRA MILITARUM') currentFaction = 'Astra Militarum';
      else if (currentFaction === 'BLACK TEMPLARS') currentFaction = 'Black Templars';
      else if (currentFaction === 'BLOOD ANGELS') currentFaction = 'Blood Angels';
      else if (currentFaction === 'SPACE WOLVES') currentFaction = 'Space Wolves';
      else if (currentFaction === 'DARK ANGELS') currentFaction = 'Dark Angels';
      else if (currentFaction === 'DEATHWATCH') currentFaction = 'Deathwatch';
      else if (currentFaction === 'GREY KNIGHTS') currentFaction = 'Grey Knights';
      else if (currentFaction === 'ADEPTUS CUSTODES') currentFaction = 'Adeptus Custodes';
      else if (currentFaction === 'ADEPTUS MECHANICUS') currentFaction = 'Adeptus Mechanicus';
      else if (currentFaction === 'CHAOS SPACE MARINES') currentFaction = 'Chaos Space Marines';
      else if (currentFaction === 'DEATH GUARD') currentFaction = 'Death Guard';
      else if (currentFaction === 'THOUSAND SONS') currentFaction = 'Thousand Sons';
      else if (currentFaction === 'WORLD EATERS') currentFaction = 'World Eaters';
      else if (currentFaction === 'CHAOS DAEMONS') currentFaction = 'Chaos Daemons';
      else if (currentFaction === 'CHAOS KNIGHTS') currentFaction = 'Chaos Knights';
      else if (currentFaction === 'AELDARI') currentFaction = 'Aeldari';
      else if (currentFaction === 'DRUKHARI') currentFaction = 'Drukhari';
      else if (currentFaction === 'ORKS') currentFaction = 'Orks';
      else if (currentFaction === 'NECRONS') currentFaction = 'Necrons';
      else if (currentFaction === 'TYRANIDS') currentFaction = 'Tyranids';
      else if (currentFaction === 'GENESTEALER CULTS') currentFaction = 'Genestealer Cults';
      else if (currentFaction === 'T’AU EMPIRE') currentFaction = "T'au Empire";
      else if (currentFaction === 'LEAGUES OF VOTANN') currentFaction = 'Leagues of Votann';
      else if (currentFaction === 'IMPERIAL KNIGHTS') currentFaction = 'Imperial Knights';

      skipSection = false;
      continue;
    }

    if (line.includes('DETACHMENT ENHANCEMENTS')) {
      skipSection = true;
      continue;
    }

    if (line.includes('FORGE WORLD POINTS VALUES') || line.includes('ARMY FACTION:') || line.includes('AGENTS OF THE IMPERIUM') || line.includes('PRODUCED BY THE WARHAMMER DESIGN STUDIO') || line.includes('Munitorum Field Manual ©') || /^\d+$/.test(line) || line.includes('LEGIONS OF EXCESS')) {
      continue;
    }

    if (skipSection) continue;
    if (!currentFaction) continue;

    const pointsMatch = line.match(/(\d+)\s*pts$/);

    if (!pointsMatch) {
      // It's a new unit name
      currentUnitName = line;
    } else {
      // It's a points line
      if (currentUnitName) {
        const points = parseInt(pointsMatch[1], 10);
        const key = `${currentFaction}-${currentUnitName}`;
        
        // Only capture the FIRST points line (which is the lowest model count / base points)
        if (!unitsMap.has(key)) {
          unitsMap.set(key, {
            faction: currentFaction,
            unit_name: currentUnitName,
            base_points: points
          });
        }
      }
    }
  }

  const units = Array.from(unitsMap.values());
  console.log(`Parsed ${units.length} units from the PDF.`);
  console.log(units.slice(0, 5));

  console.log('Generating seed_units.sql...');

  let sql = `-- Clear existing official units (excluding custom user additions if needed, but for now we clear all to reset to official)\n`;
  sql += `DELETE FROM unit_points;\n\n`;
  sql += `INSERT INTO unit_points (faction, unit_name, base_points)\nVALUES\n`;

  const values = units.map((u: any) => {
    const safeFaction = u.faction.replace(/'/g, "''");
    const safeUnit = u.unit_name.replace(/'/g, "''");
    return `  ('${safeFaction}', '${safeUnit}', ${u.base_points})`;
  });

  sql += values.join(',\n') + ';\n';

  fs.writeFileSync(path.join(__dirname, '../seed_units.sql'), sql);
  console.log('Successfully generated seed_units.sql! Please run this file in your Supabase SQL Editor to seed the database.');
}

seedDatabase().catch(console.error);
