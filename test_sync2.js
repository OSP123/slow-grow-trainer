import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('unit_points')
    .select('*')
    .eq('faction', 'Space Marines')
    .eq('unit_name', 'Chaplain');
  
  if (error) {
    console.error("Fetch error:", JSON.stringify(error));
  } else {
    console.log("unit_points for Chaplain:", JSON.stringify(data, null, 2));
  }
}

run();
