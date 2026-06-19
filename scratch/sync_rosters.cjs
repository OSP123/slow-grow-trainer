const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching MFM Unit Points...");
  const { data: registry, error: regErr } = await supabase.from('unit_points').select('*');
  if (regErr) { console.error("Error fetching registry:", regErr); return; }

  console.log("Fetching Army Units...");
  const { data: armyUnits, error: armyErr } = await supabase.from('army_units').select('*').order('created_at', { ascending: true });
  if (armyErr) { console.error("Error fetching army units:", armyErr); return; }

  // Group by profile_id -> faction -> unit_name (case insensitive)
  const grouped = {};
  for (const u of armyUnits) {
    if (!u.faction || !u.unit_name) continue;
    
    // Find matching MFM entry (case insensitive)
    const mfmEntry = registry.find(r => r.faction === u.faction && r.unit_name.toLowerCase() === u.unit_name.toLowerCase());
    
    // Only process units that have an official MFM entry
    if (!mfmEntry) continue;

    const key = `${u.profile_id}_${u.faction}_${u.unit_name.toLowerCase()}`;
    if (!grouped[key]) {
      grouped[key] = { mfm: mfmEntry, units: [] };
    }
    grouped[key].units.push(u);
  }

  const updates = [];

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
          // If the model count doesn't perfectly match (e.g. they have an illegal unit size)
          // Default to the base tier points or closest match to prevent nulls
          newPoints = applicableTiers[0].points;
        }
      } else if (mfm.base_points != null) {
        newPoints = mfm.base_points;
      }

      if (newPoints !== u.points) {
        updates.push({ id: u.id, points: newPoints, old: u.points, unit_name: u.unit_name, copy: copyIndex });
      }
    }
  }

  console.log(`Prepared ${updates.length} point updates for existing rosters.`);
  
  if (updates.length > 0) {
    console.log("Updating database...");
    let success = 0;
    for (const update of updates) {
      const { error } = await supabase.from('army_units').update({ points: update.points }).eq('id', update.id);
      if (error) {
        console.error(`Failed to update ${update.unit_name} (ID: ${update.id}):`, error);
      } else {
        success++;
      }
    }
    console.log(`Successfully updated ${success}/${updates.length} units.`);
  } else {
    console.log("All existing units are perfectly in sync with the MFM.");
  }
}

run();
