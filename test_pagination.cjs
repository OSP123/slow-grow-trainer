const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    let allData = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
      console.log(`Fetching offset ${offset} to ${offset + limit - 1}...`);
      const { data, error: fetchError } = await supabase
        .from('unit_points')
        .select('id, faction, unit_name, base_points')
        .order('faction', { ascending: true })
        .order('unit_name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error(fetchError);
        return;
      }

      console.log(`Got ${data.length} rows.`);

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        offset += limit;
        if (data.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Total rows fetched: ${allData.length}`);
    const we = allData.filter(d => d.faction === 'World Eaters');
    console.log(`World Eaters: ${we.length}`);
}

test();
