import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('id, location, experience_level, army_faction, commander_name, payment_status, role, hobby_milestones(milestone_step)').order('commander_name');
  console.log('Error:', error);
  console.log('Profiles:', data);
}
run();
