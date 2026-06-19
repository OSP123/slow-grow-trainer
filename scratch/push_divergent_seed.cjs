require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const sql = fs.readFileSync('seed_divergent_units.sql', 'utf8');
  // Since we can't run raw SQL easily via the JS client, let's extract the VALUES and UPSERT them.
  // Wait, I already have the 'allUnits' array in memory if I just run the extraction logic here.
  // But since I already generated the SQL, I'll just regex the SQL values.
  
  const matches = [...sql.matchAll(/\('([^']+)', '([^']+)', (\d+), '([^']+)'::jsonb\)/g)];
  
  console.log(`Found ${matches.length} units to upsert...`);
  
  // First, delete divergent chapters
  const divergentChapters = ['Blood Angels', 'Dark Angels', 'Space Wolves', 'Black Templars', 'Deathwatch'];
  console.log('Deleting existing divergent units...');
  const { error: delError } = await supabase.from('unit_points').delete().in('faction', divergentChapters);
  if (delError) {
    console.error('Delete error:', delError);
    return;
  }
  
  const units = matches.map(m => ({
    faction: m[1],
    unit_name: m[2].replace(/''/g, "'"),
    base_points: parseInt(m[3], 10),
    cost_tiers: JSON.parse(m[4].replace(/''/g, "'"))
  }));
  
  // Insert in batches of 100
  for (let i = 0; i < units.length; i += 100) {
    const batch = units.slice(i, i + 100);
    const { error } = await supabase.from('unit_points').insert(batch);
    if (error) {
      console.error('Insert error at batch', i, error);
    } else {
      console.log(`Inserted batch ${i} to ${i + 100}`);
    }
  }
  
  console.log('Finished pushing divergent units to Supabase.');
}

run();
