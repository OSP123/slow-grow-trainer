const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to convert ALL CAPS to Title Case, preserving some uppercase acronyms if needed
function toTitleCase(str) {
  return str.split(' ').map(word => {
    // Leave numbers and symbols alone
    if (word.length === 0) return word;
    // Don't lower case single letters usually, except a, of, the, etc. but we'll just do basic title case
    const lowerWords = ['of', 'the', 'and', 'in', 'on', 'with'];
    const w = word.toLowerCase();
    if (lowerWords.includes(w) && str.toLowerCase().indexOf(w) !== 0) {
      return w;
    }
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

async function run() {
  console.log("Fetching MFM Unit Points...");
  const { data: registry, error: regErr } = await supabase.from('unit_points').select('*');
  if (regErr) { console.error("Error fetching registry:", regErr); return; }

  console.log("Fetching Army Units...");
  const { data: armyUnits, error: armyErr } = await supabase.from('army_units').select('*').order('created_at', { ascending: true });
  if (armyErr) { console.error("Error fetching army units:", armyErr); return; }

  let sqlOutput = "-- Fix ALL CAPS in unit_points\n\n";

  // 1. Generate updates for unit_points
  for (const mfm of registry) {
    if (mfm.unit_name === mfm.unit_name.toUpperCase()) {
      const titleCased = toTitleCase(mfm.unit_name);
      // Escape single quotes for SQL
      const safeTitle = titleCased.replace(/'/g, "''");
      sqlOutput += `UPDATE public.unit_points SET unit_name = '${safeTitle}' WHERE id = '${mfm.id}';\n`;
    }
  }

  sqlOutput += "\n-- Update points in army_units to match 11th Edition escalation logic\n\n";

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
          // Default to the first applicable tier if no exact model match
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

  fs.writeFileSync('fix_caps_and_sync.sql', sqlOutput);
  console.log(`Generated fix_caps_and_sync.sql with unit_points fixes and ${updateCount} army_units point updates.`);
}

run();
