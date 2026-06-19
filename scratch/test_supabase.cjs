const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('unit_points')
    .select('unit_name')
    .eq('faction', 'World Eaters');
  
  if (error) console.error(error);
  console.log('World Eaters units in DB:', data.length);
  console.log(data.map(d => d.unit_name).join(', '));
}

test();
