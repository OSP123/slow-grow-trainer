const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('gallery_comments')
    .select('id, comment, created_at, user_id, profiles!inner(commander_name)')
    .limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
