import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `test_${Date.now()}@example.com`;
  console.log("Signing up:", email);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: {
        commander_name: 'TestCommander',
        location: 'Earth',
        experience_level: 'beginner',
        army_faction: 'Imperium'
      }
    }
  });

  if (signUpError) {
    console.error("Signup error:", signUpError.message);
    return;
  }

  console.log("Signup success! User ID:", signUpData.user?.id);

  // Now let's try to fetch profiles
  const { data: profiles, error: fetchErr } = await supabase
    .from('profiles')
    .select('id, commander_name, role, private_profiles(discord_name)')
    .order('commander_name');

  if (fetchErr) {
    console.error("Fetch error:", JSON.stringify(fetchErr));
  } else {
    console.log(`Found ${profiles?.length} profiles!`);
    if (profiles && profiles.length > 0) {
      console.log("First profile:", JSON.stringify(profiles[0], null, 2));
    }
  }
}

run();
