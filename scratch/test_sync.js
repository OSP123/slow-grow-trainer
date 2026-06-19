import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Let's do a public SELECT on army_units if RLS permits, or just fetch some army_units and compare.
  const { data: units, error } = await supabase
    .from('army_units')
    .select('*')
    .limit(10);
  
  if (error) {
    console.error("Fetch error:", JSON.stringify(error));
  } else {
    console.log(`Found ${units?.length || 0} army_units.`);
    if (units && units.length > 0) {
      console.log(units[0]);
    }
  }
}

run();
