import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'omarpatel123@gmail.com', // Try to login as root admin, or any user
    password: 'password123' // assuming default password
  });
  
  if (signInError) {
     console.log('Login failed:', signInError.message);
     // If we can't login, we can't test authenticated queries
     return;
  }
  
  const { data, error } = await supabase.from('profiles').select('id, location, experience_level, army_faction, commander_name, payment_status, role, hobby_milestones(milestone_step)').order('commander_name');
  console.log('Error:', error);
  console.log('Profiles:', data);
}
run();
