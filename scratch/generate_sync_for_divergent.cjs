const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching Army Units...");
  const divergentChapters = ['Blood Angels', 'Dark Angels', 'Space Wolves', 'Black Templars', 'Deathwatch'];
  const { data: armyUnits, error: armyErr } = await supabase.from('army_units')
    .select('*')
    .in('faction', divergentChapters)
    .order('created_at', { ascending: true });
    
  if (armyErr) { console.error("Error fetching army units:", armyErr); return; }

  // Read the divergent units we just parsed
  const divergentSql = fs.readFileSync('seed_divergent_units.sql', 'utf8');
  const matches = [...divergentSql.matchAll(/\('([^']+)', '([^']+)', (\d+), '([^']+)'::jsonb\)/g)];
  
  const mfmRegistry = matches.map(m => ({
    faction: m[1],
    unit_name: m[2].replace(/''/g, "'"),
    base_points: parseInt(m[3], 10),
    cost_tiers: JSON.parse(m[4].replace(/''/g, "'"))
  }));

  let sqlOutput = "\n\n-- Sync army_units points for Divergent Chapters based on new MFM data\n";

  const grouped = {};
  for (const u of armyUnits) {
    if (!u.faction || !u.unit_name) continue;
    
    // Find matching MFM entry (case insensitive)
    let mfmEntry = mfmRegistry.find(r => r.faction === u.faction && r.unit_name.toLowerCase() === u.unit_name.toLowerCase());
    
    if (!mfmEntry) continue;

    const key = `${u.profile_id}_${u.faction}_${u.unit_name.toLowerCase()}`;
    if (!grouped[key]) {
      grouped[key] = { mfm: mfmEntry, units: [] };
    }
    grouped[key].units.push(u);
  }

  let updateCount = 0;

  for (const key in grouped) {
    const { mfm, units } = grouped[key];
    
    // units are already ordered by created_at
    for (let i = 0; i < units.length; i++) {
      const copyIndex = i + 1; // 1st, 2nd, 3rd, etc.
      const u = units[i];

      let newPoints = u.points;

      if (mfm.cost_tiers && mfm.cost_tiers.length > 0) {
        let activeEscalation = null;
        if (copyIndex >= 4 && mfm.cost_tiers.some(t => t.escalation === '4th+')) activeEscalation = '4th+';
        else if (copyIndex >= 3 && mfm.cost_tiers.some(t => t.escalation === '3rd+')) activeEscalation = '3rd+';
        else if (copyIndex >= 2 && mfm.cost_tiers.some(t => t.escalation === '2nd+')) activeEscalation = '2nd+';

        let applicableTiers = mfm.cost_tiers.filter(t => t.escalation === activeEscalation);
        if (applicableTiers.length === 0) {
          applicableTiers = mfm.cost_tiers.filter(t => t.escalation == null);
        }

        const exactTier = applicableTiers.find(t => t.models === u.model_count);
        if (exactTier) {
          newPoints = exactTier.points;
        } else if (applicableTiers.length > 0) {
          newPoints = applicableTiers[0].points;
        }
      } else if (mfm.base_points != null) {
        newPoints = mfm.base_points;
      }

      if (newPoints !== u.points) {
        sqlOutput += `UPDATE public.army_units SET points = ${newPoints} WHERE id = '${u.id}';\n`;
        updateCount++;
      }
    }
  }

  if (updateCount > 0) {
    fs.appendFileSync('seed_divergent_units.sql', sqlOutput);
    console.log(`Appended ${updateCount} army_units point updates to seed_divergent_units.sql.`);
  } else {
    console.log('No army_units required point updates.');
  }
}

run();
