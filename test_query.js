import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'e2e_test_user@example.com',
    password: 'Password123!'
  });

  if (authErr) {
    console.log("Could not login as test user, maybe it doesnt exist:", authErr.message);
  }

  const { data, error } = await supabase
      .from('profiles')
      .select('id, location, experience_level, army_faction, commander_name, payment_status, role, campaign_status, private_profiles(discord_name, real_name, email)')
      .limit(1);

  if (error) {
    console.error("Query Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Got", data.length, "users");
    console.log("Sample:", JSON.stringify(data, null, 2));
  }
}

testQuery();
