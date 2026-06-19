import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: units } = await supabase
    .from('army_units')
    .select('*')
    .limit(100);

  const { data: pointsDict } = await supabase
    .from('unit_points')
    .select('*');

  let discrepancies = 0;
  
  for (const u of units || []) {
    const dict = pointsDict.find(d => d.faction === u.faction && d.unit_name === u.unit_name);
    if (!dict) continue;

    let correctPoints = null;
    if (dict.cost_tiers && dict.cost_tiers.length > 0) {
      const tier = dict.cost_tiers.find(t => t.models === u.model_count);
      if (tier) correctPoints = tier.points;
    } else {
      correctPoints = dict.base_points;
    }

    if (correctPoints !== null && u.points !== correctPoints) {
      console.log(`Discrepancy: ${u.unit_name} (${u.model_count} models). Roster has ${u.points}, Dict has ${correctPoints}`);
      discrepancies++;
    }
  }

  console.log(`Total discrepancies found: ${discrepancies}`);
}

run();
