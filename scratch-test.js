import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchRegistry() {
    let allData = [];
    let hasMore = true;
    let offset = 0;
    const limit = 1000;

    while (hasMore) {
        console.log(`Fetching offset ${offset}...`);
        const { data, error } = await supabase
            .from('unit_points')
            .select('id, faction, unit_name, base_points')
            .order('faction', { ascending: true })
            .order('unit_name', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error:", error);
            return;
        }
        
        console.log(`Fetched ${data.length} rows.`);

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

    console.log("Total units fetched:", allData.length);
    
    const worldEaters = allData.filter(u => u.faction === 'World Eaters');
    console.log("World Eaters units:", worldEaters.length);
    if (worldEaters.length > 0) {
        console.log("First World Eater:", worldEaters[0].unit_name);
    }
}

fetchRegistry();
