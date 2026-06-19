import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  // Login as admin
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'omarpatel123@gmail.com',
    password: 'password123'
  });
  
  if (authErr) {
    console.error("Auth error:", authErr.message);
    return;
  }
  
  console.log("Logged in as:", authData.user.id);

  const { data, error } = await supabase
      .from('profiles')
      .select('id, location, experience_level, army_faction, commander_name, payment_status, role, campaign_status, private_profiles(discord_name, real_name, email)')
      .order('commander_name');

  if (error) {
    console.error("Query Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Got", data.length, "users");
    if (data.length > 0) {
      console.log("Sample:", data[0].private_profiles);
    }
  }
}

testQuery();
